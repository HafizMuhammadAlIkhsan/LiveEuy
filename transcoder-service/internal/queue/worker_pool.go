package queue

import (
	"context"
	"errors"
	"fmt"
	"log"
	"sync"
	"time"

	"github.com/LiveEuy/transcoder-service/internal/domain"
	"github.com/LiveEuy/transcoder-service/internal/storage"
)

type TranscodeProcessor interface {
	ProcessJob(ctx context.Context, job *domain.TranscodeJob, progressCb func(domain.ProgressEvent)) error
}

type WorkerPool struct {
	maxWorkers  int
	jobQueue    chan *domain.TranscodeJob
	jobs        map[string]*domain.TranscodeJob
	cancelFuncs map[string]context.CancelFunc
	subscribers map[string][]chan domain.ProgressEvent
	mu          sync.RWMutex
	processor   TranscodeProcessor
	storage     storage.Storage
	stopChan    chan struct{}
	wg          sync.WaitGroup
}

func NewWorkerPool(maxWorkers int, processor TranscodeProcessor, st storage.Storage) *WorkerPool {
	if maxWorkers <= 0 {
		maxWorkers = 2
	}
	return &WorkerPool{
		maxWorkers:  maxWorkers,
		jobQueue:    make(chan *domain.TranscodeJob, 100),
		jobs:        make(map[string]*domain.TranscodeJob),
		cancelFuncs: make(map[string]context.CancelFunc),
		subscribers: make(map[string][]chan domain.ProgressEvent),
		processor:   processor,
		storage:     st,
		stopChan:    make(chan struct{}),
	}
}

func (p *WorkerPool) Start() {
	for i := 1; i <= p.maxWorkers; i++ {
		p.wg.Add(1)
		go p.worker(i)
	}
	log.Printf("👷 [WORKER POOL] Berjalan dengan %d concurrency worker", p.maxWorkers)
}

func (p *WorkerPool) Stop() {
	close(p.stopChan)
	p.wg.Wait()
}

func (p *WorkerPool) SubmitJob(job *domain.TranscodeJob) error {
	p.mu.Lock()
	p.jobs[job.ID] = job
	p.mu.Unlock()

	select {
	case p.jobQueue <- job:
		log.Printf("📥 [QUEUE] Job '%s' (%s) masuk ke dalam antrean", job.ID, job.Title)
		return nil
	default:
		p.UpdateJob(job.ID, func(j *domain.TranscodeJob) {
			j.Status = domain.StatusFailed
			j.ErrorMessage = "Antrean transkoding penuh"
		})
		return errors.New("antrean transkoding penuh")
	}
}

func (p *WorkerPool) worker(workerID int) {
	defer p.wg.Done()

	for {
		select {
		case <-p.stopChan:
			return
		case job, ok := <-p.jobQueue:
			if !ok {
				return
			}
			p.process(workerID, job)
		}
	}
}

func (p *WorkerPool) process(workerID int, job *domain.TranscodeJob) {
	ctx, cancel := context.WithCancel(context.Background())

	p.mu.Lock()
	p.cancelFuncs[job.ID] = cancel
	p.jobs[job.ID].Status = domain.StatusProcessing
	p.jobs[job.ID].UpdatedAt = time.Now()
	p.mu.Unlock()

	log.Printf("▶️ [WORKER %d] Memulai transkoding job: %s (%s)", workerID, job.ID, job.Title)

	// Callback update progres
	progressCb := func(evt domain.ProgressEvent) {
		p.UpdateJob(job.ID, func(j *domain.TranscodeJob) {
			j.Progress = evt.Progress
			j.Speed = evt.Speed
			j.CurrentFPS = evt.CurrentFPS
			j.ETASeconds = evt.ETASeconds
			j.UpdatedAt = time.Now()
		})
		p.broadcastProgress(evt)
	}

	err := p.processor.ProcessJob(ctx, job, progressCb)

	p.mu.Lock()
	delete(p.cancelFuncs, job.ID)
	now := time.Now()
	if err != nil {
		if errors.Is(ctx.Err(), context.Canceled) {
			p.jobs[job.ID].Status = domain.StatusCancelled
			p.jobs[job.ID].ErrorMessage = "Job dibatalkan oleh administrator"
			log.Printf("⏹️ [WORKER %d] Job %s dibatalkan", workerID, job.ID)
		} else {
			p.jobs[job.ID].Status = domain.StatusFailed
			p.jobs[job.ID].ErrorMessage = err.Error()
			log.Printf("❌ [WORKER %d] Job %s gagal: %v", workerID, job.ID, err)
		}
	} else {
		p.jobs[job.ID].Status = domain.StatusCompleted
		p.jobs[job.ID].Progress = 100.0
		p.jobs[job.ID].CompletedAt = &now
		log.Printf("✅ [WORKER %d] Job %s selesai berhasil!", workerID, job.ID)
	}
	p.jobs[job.ID].UpdatedAt = now
	p.mu.Unlock()
}

func (p *WorkerPool) CancelJob(jobID string) error {
	p.mu.Lock()
	defer p.mu.Unlock()

	job, exists := p.jobs[jobID]
	if !exists {
		return errors.New("job tidak ditemukan")
	}

	if job.Status == domain.StatusCompleted || job.Status == domain.StatusFailed || job.Status == domain.StatusCancelled {
		return fmt.Errorf("job sudah selesai dengan status: %s", job.Status)
	}

	if cancel, running := p.cancelFuncs[jobID]; running {
		cancel()
	} else {
		job.Status = domain.StatusCancelled
		job.ErrorMessage = "Dibatalkan sebelum dieksekusi"
	}

	return nil
}

func (p *WorkerPool) GetJob(jobID string) (*domain.TranscodeJob, bool) {
	p.mu.RLock()
	defer p.mu.RUnlock()
	job, exists := p.jobs[jobID]
	if !exists {
		return nil, false
	}
	// Salin pointer agar thread-safe
	copyOfJob := *job
	return &copyOfJob, true
}

func (p *WorkerPool) ListJobs(status string, page, limit int) ([]*domain.TranscodeJob, int) {
	p.mu.RLock()
	defer p.mu.RUnlock()

	var filtered []*domain.TranscodeJob
	for _, j := range p.jobs {
		if status == "" || string(j.Status) == status {
			cp := *j
			filtered = append(filtered, &cp)
		}
	}

	total := len(filtered)
	if page <= 0 {
		page = 1
	}
	if limit <= 0 {
		limit = 10
	}

	start := (page - 1) * limit
	if start >= total {
		return []*domain.TranscodeJob{}, total
	}
	end := start + limit
	if end > total {
		end = total
	}

	return filtered[start:end], total
}

func (p *WorkerPool) UpdateJob(jobID string, updateFn func(job *domain.TranscodeJob)) {
	p.mu.Lock()
	defer p.mu.Unlock()
	if job, ok := p.jobs[jobID]; ok {
		updateFn(job)
	}
}

func (p *WorkerPool) SubscribeProgress(jobID string) (<-chan domain.ProgressEvent, func()) {
	ch := make(chan domain.ProgressEvent, 20)
	p.mu.Lock()
	p.subscribers[jobID] = append(p.subscribers[jobID], ch)
	p.mu.Unlock()

	unsubscribe := func() {
		p.mu.Lock()
		defer p.mu.Unlock()
		subs := p.subscribers[jobID]
		for i, sub := range subs {
			if sub == ch {
				p.subscribers[jobID] = append(subs[:i], subs[i+1:]...)
				close(ch)
				break
			}
		}
	}

	return ch, unsubscribe
}

func (p *WorkerPool) broadcastProgress(evt domain.ProgressEvent) {
	p.mu.RLock()
	defer p.mu.RUnlock()
	subs := p.subscribers[evt.JobID]
	for _, ch := range subs {
		select {
		case ch <- evt:
		default:
		}
	}
}
