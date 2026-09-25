import '../../models/movie_model.dart';
import '../../models/episode_model.dart';
import '../../models/review_model.dart';

class MockData {
  // Sample streaming videos (Public sample MP4 videos)
  static const String sampleVideo1 =
      'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4';
  static const String sampleVideo2 =
      'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ElephantsDream.mp4';
  static const String sampleVideo3 =
      'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/TearsOfSteel.mp4';
  static const String sampleVideo4 =
      'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4';

  static final List<Movie> heroMovies = [
    const Movie(
      id: 'm_hero',
      title: 'Gundala: Negeri Terakhir',
      synopsis:
          'Ketika peradaban berada di ambang keruntuhan akibat intrik elite bawah tanah, Sancaka harus merelakan segalanya demi menyalakan petir terakhir penentu nasib bangsa.',
      posterUrl:
          'https://lh3.googleusercontent.com/aida-public/AB6AXuChxR7qJY8oJAUH9fjwwBQ0UiHMDmcnzTrPpVONtc8qEjz2zwPZZxhgKv8CCEdhKLoBjhcZlcZ325bNnL741oqm7KEI1qaQidW9ui3BggZmizl1UZYDVVVKT0x71GHZtZn5QwovgLN23ExGqe_x8OEmuC1o419OosQ4J669bteS8e9hec3Ay-VzLrGkH6o3XXAmGLToVNhKKX-YazhUTVZAZhbJ7AV3p0zexIVwcf2cItNqaW5og1NR',
      backdropUrl:
          'https://lh3.googleusercontent.com/aida-public/AB6AXuChxR7qJY8oJAUH9fjwwBQ0UiHMDmcnzTrPpVONtc8qEjz2zwPZZxhgKv8CCEdhKLoBjhcZlcZ325bNnL741oqm7KEI1qaQidW9ui3BggZmizl1UZYDVVVKT0x71GHZtZn5QwovgLN23ExGqe_x8OEmuC1o419OosQ4J669bteS8e9hec3Ay-VzLrGkH6o3XXAmGLToVNhKKX-YazhUTVZAZhbJ7AV3p0zexIVwcf2cItNqaW5og1NR',
      videoUrl: sampleVideo1,
      matchScore: 98,
      ageRating: '18+',
      resolutionBadges: ['4K UHD', 'Dolby Atmos'],
      genre: 'Aksi & Pahlawan Super',
      durationOrSeasons: '2 Jam 15 Min',
      releaseYear: 2024,
      director: 'Joko Anwar',
      cast: ['Abimana Aryasatya', 'Tara Basro', 'Bront Palarae', 'Ario Bayu'],
      isTop10: true,
      top10Rank: 1,
      userRating: 9.3,
    ),
    const Movie(
      id: 'm1',
      title: 'Gadis Kretek',
      synopsis:
          'Berlatar tahun 1960-an hingga awal 2000-an, perjalanan cinta dan penemuan jati diri terungkap saat seorang perajin wanita berbakat menentang tradisi industri kretek di Jawa Tengah, mewariskan rahasia racikan saus rokok legendaris yang dicari oleh anak-anak pewaris konglomerat kretek modern.',
      posterUrl:
          'https://lh3.googleusercontent.com/aida-public/AB6AXuD_ja_wlkaQPjYJLOoC3LoQ38WRHQcxUcT8lv6tUtnJyJval-lNEZ9JQ9MQqCyM5fm89UvInMHQzKvqNUQBvXZK1gpmt3hweQqRqjpF1ctOzKjPUERj-Mbpim0PtHSq-u7j_eHFotwP2xgGXMIsxNszo052yrYOenxf6XxrdnjslMjamv-SYmTyVwuZwfg4A-JeoIPjKuTPDMds_c6RZzgBvIxXCIQTNxVhMZKqWSXpDLNecZ7f5NdZ',
      backdropUrl:
          'https://lh3.googleusercontent.com/aida-public/AB6AXuCjdvdOFXeTmIT0VH1mQG_5UPj3BbwqC2N78FzmXwirV6ZTNkU05ON91XHJMlviFJLGyGoJbT894OE97CGGxqFRj7B5g8nQUTx6Y5yYDroC4xK0Nhp-apW7Jlg0sJ4J26e4nbbPf7TUTC9MtMsHSLrXV0jg0COWPY_baO6U7tpj-je1YGL6ElxfXmdAFtzeB_L5EjQOtILcV59st2TNsAe5vaLUVaztTJhkh1T8g-NCFsZREoH7TU8S',
      videoUrl: sampleVideo2,
      matchScore: 99,
      ageRating: '16+',
      resolutionBadges: ['4K UHD', 'Dolby Vision', 'Dolby Atmos'],
      genre: 'Drama Periode',
      durationOrSeasons: '1 Musim (5 Episode)',
      releaseYear: 2023,
      director: 'Kamila Andini, Ifa Isfansyah',
      cast: ['Dian Sastrowardoyo', 'Ario Bayu', 'Putri Marino', 'Arya Saloka'],
      isTop10: true,
      top10Rank: 1,
      userRating: 8.8,
    ),
    const Movie(
      id: 'm3',
      title: 'The Shadow Strays',
      synopsis:
          'Seorang pembunuh bayaran muda bernama 13 menantang organisasi pembunuh terkuat demi menyelamatkan seorang anak laki-laki yang diculik mafia.',
      posterUrl:
          'https://lh3.googleusercontent.com/aida-public/AB6AXuCJLiMdFenbqVD-CublKi6On_k_ymnMERa6D-OjWW2ColGnO09RD3G9V6DGZG1-a_bFHM1dSIOso97uiuVxGM-Tpw090uM6ZpXthuKT4E6_yX1ylXRqIlN2li0RVYNifH--UwoWtfgOYPWik__ZPP5c9bvCzgzat61XkY2K4morzGQh_l0KbKX4ib2wot_6L0KBfi-UTkZ1gDJ64ov2v0gZKEDejXyCY1Ko5EtYq5Sfufr_HTUJIdfH',
      backdropUrl:
          'https://lh3.googleusercontent.com/aida-public/AB6AXuCZ0xbfQIFfSpAShzjeOOZskzsuS7t8k1yVubeKxbmSIeb95GaRwgxYF-jIM1WG-sVp0LNxaKp3a1PT9R4hlg6CIfEA5ZdYrzI21zKBwPNaFZNAA4FSAXeZ1d5Xnv9b58lJtFSX49jMrwkOSHBwqurp3CNEUprffoECBnhd1yN5qG_rDGtp67E0Zcth_ynC9oK_StgdqbVDLxQcqeeDd0MV5lMSwC3UCu15Hxk4_4hMJ-oaml-c48B-',
      videoUrl: sampleVideo3,
      matchScore: 97,
      ageRating: '18+',
      resolutionBadges: ['4K UHD', 'Dolby Atmos'],
      genre: 'Aksi & Laga',
      durationOrSeasons: '2 Jam 24 Min',
      releaseYear: 2024,
      director: 'Timo Tjahjanto',
      cast: ['Aurora Ribero', 'Hana Malasan', 'Ali Fikry', 'Adipati Dolken'],
      isTop10: true,
      top10Rank: 2,
      userRating: 9.0,
    ),
  ];

  static final List<Movie> continueWatchingList = [
    const Movie(
      id: 'cw_1',
      title: 'The Shadow Strays',
      synopsis: 'Pembunuh bayaran muda 13 melacak sindikat...',
      posterUrl:
          'https://lh3.googleusercontent.com/aida-public/AB6AXuCJLiMdFenbqVD-CublKi6On_k_ymnMERa6D-OjWW2ColGnO09RD3G9V6DGZG1-a_bFHM1dSIOso97uiuVxGM-Tpw090uM6ZpXthuKT4E6_yX1ylXRqIlN2li0RVYNifH--UwoWtfgOYPWik__ZPP5c9bvCzgzat61XkY2K4morzGQh_l0KbKX4ib2wot_6L0KBfi-UTkZ1gDJ64ov2v0gZKEDejXyCY1Ko5EtYq5Sfufr_HTUJIdfH',
      backdropUrl:
          'https://lh3.googleusercontent.com/aida-public/AB6AXuCJLiMdFenbqVD-CublKi6On_k_ymnMERa6D-OjWW2ColGnO09RD3G9V6DGZG1-a_bFHM1dSIOso97uiuVxGM-Tpw090uM6ZpXthuKT4E6_yX1ylXRqIlN2li0RVYNifH--UwoWtfgOYPWik__ZPP5c9bvCzgzat61XkY2K4morzGQh_l0KbKX4ib2wot_6L0KBfi-UTkZ1gDJ64ov2v0gZKEDejXyCY1Ko5EtYq5Sfufr_HTUJIdfH',
      videoUrl: sampleVideo3,
      matchScore: 97,
      ageRating: '18+',
      resolutionBadges: ['4K UHD'],
      genre: 'Aksi',
      durationOrSeasons: '1j 14m tersisa',
      releaseYear: 2024,
      director: 'Timo Tjahjanto',
      cast: ['Aurora Ribero'],
      continueWatchingProgress: 0.65,
    ),
    const Movie(
      id: 'cw_2',
      title: 'Pengabdi Setan 2: Communion',
      synopsis: 'Keluarga Rini terjebak di rumah susun terisolasi...',
      posterUrl:
          'https://lh3.googleusercontent.com/aida-public/AB6AXuCHSLn_cWJASAgwcTrwLHPw3lzwnqYtdw_ZQFZF0F8uy3aJ0xefitxRVm-q9Vc00G8Q1RyT_XF6sGZzb-Nbd25bW68DD1IjaU5REs34FvXSjVHwE8CWtaxr3iDkuW9thGDLZjJsV8HsmYNuuBkgil1PlKnNeJ4N8PAhxbfxSHaHw7SA-YTjoTOFMAuLkXhk_RQoZTA8XFDK4TiQqwyXwFNC4lTPZ0cpMndIFyGLcKT0NFibnxxNLn2w',
      backdropUrl:
          'https://lh3.googleusercontent.com/aida-public/AB6AXuCHSLn_cWJASAgwcTrwLHPw3lzwnqYtdw_ZQFZF0F8uy3aJ0xefitxRVm-q9Vc00G8Q1RyT_XF6sGZzb-Nbd25bW68DD1IjaU5REs34FvXSjVHwE8CWtaxr3iDkuW9thGDLZjJsV8HsmYNuuBkgil1PlKnNeJ4N8PAhxbfxSHaHw7SA-YTjoTOFMAuLkXhk_RQoZTA8XFDK4TiQqwyXwFNC4lTPZ0cpMndIFyGLcKT0NFibnxxNLn2w',
      videoUrl: sampleVideo1,
      matchScore: 94,
      ageRating: '17+',
      resolutionBadges: ['4K UHD'],
      genre: 'Horor',
      durationOrSeasons: '48m tersisa',
      releaseYear: 2022,
      director: 'Joko Anwar',
      cast: ['Tara Basro'],
      continueWatchingProgress: 0.32,
    ),
    const Movie(
      id: 'cw_3',
      title: 'Mencuri Raden Saleh',
      synopsis: 'Sekelompok pemuda berencana mencuri lukisan bersejarah...',
      posterUrl:
          'https://lh3.googleusercontent.com/aida-public/AB6AXuCvSAQfk73Ost_BO_5v-5pKB3ePUfLHybc-BP-j2rlfrzeFouYyXy_BlM-xcZ7j3jW86DKQbxdGQaSsn2wmK3-_-vCJk-xreLuxncjWjBMVxW-FR9Zw5tPyfDda22YTrXZN3KRrZoe7uraGsrMOCP_aYuZD8J8DFYJ1PZ57B_N0iwxeVTgkM3ZD8gaRpHGGUVqGlerbMmGxpoo-wWAYTrIGkC-03QwexPqNyB08ZehAL7w0oDPDV9bC',
      backdropUrl:
          'https://lh3.googleusercontent.com/aida-public/AB6AXuCvSAQfk73Ost_BO_5v-5pKB3ePUfLHybc-BP-j2rlfrzeFouYyXy_BlM-xcZ7j3jW86DKQbxdGQaSsn2wmK3-_-vCJk-xreLuxncjWjBMVxW-FR9Zw5tPyfDda22YTrXZN3KRrZoe7uraGsrMOCP_aYuZD8J8DFYJ1PZ57B_N0iwxeVTgkM3ZD8gaRpHGGUVqGlerbMmGxpoo-wWAYTrIGkC-03QwexPqNyB08ZehAL7w0oDPDV9bC',
      videoUrl: sampleVideo4,
      matchScore: 96,
      ageRating: '13+',
      resolutionBadges: ['FHD 1080p'],
      genre: 'Heist & Laga',
      durationOrSeasons: '18m tersisa',
      releaseYear: 2022,
      director: 'Angga Dwimas Sasongko',
      cast: ['Iqbaal Ramadhan', 'Angga Yunanda'],
      continueWatchingProgress: 0.88,
    ),
  ];

  static final List<Movie> top10Movies = [
    const Movie(
      id: 'm1',
      title: 'Gadis Kretek',
      synopsis: 'Pencarian seorang anak atas kisah masa lalu ayahnya...',
      posterUrl:
          'https://lh3.googleusercontent.com/aida-public/AB6AXuD_ja_wlkaQPjYJLOoC3LoQ38WRHQcxUcT8lv6tUtnJyJval-lNEZ9JQ9MQqCyM5fm89UvInMHQzKvqNUQBvXZK1gpmt3hweQqRqjpF1ctOzKjPUERj-Mbpim0PtHSq-u7j_eHFotwP2xgGXMIsxNszo052yrYOenxf6XxrdnjslMjamv-SYmTyVwuZwfg4A-JeoIPjKuTPDMds_c6RZzgBvIxXCIQTNxVhMZKqWSXpDLNecZ7f5NdZ',
      backdropUrl:
          'https://lh3.googleusercontent.com/aida-public/AB6AXuCjdvdOFXeTmIT0VH1mQG_5UPj3BbwqC2N78FzmXwirV6ZTNkU05ON91XHJMlviFJLGyGoJbT894OE97CGGxqFRj7B5g8nQUTx6Y5yYDroC4xK0Nhp-apW7Jlg0sJ4J26e4nbbPf7TUTC9MtMsHSLrXV0jg0COWPY_baO6U7tpj-je1YGL6ElxfXmdAFtzeB_L5EjQOtILcV59st2TNsAe5vaLUVaztTJhkh1T8g-NCFsZREoH7TU8S',
      videoUrl: sampleVideo2,
      matchScore: 99,
      ageRating: '16+',
      resolutionBadges: ['4K UHD', 'Dolby Vision'],
      genre: 'Terpopuler',
      durationOrSeasons: '1 Musim',
      releaseYear: 2023,
      director: 'Kamila Andini',
      cast: ['Dian Sastrowardoyo'],
      isTop10: true,
      top10Rank: 1,
    ),
    const Movie(
      id: 'top_2',
      title: 'Sri Asih',
      synopsis: 'Kisah Alana membangkitkan kekuatan dewi pelindung bumi.',
      posterUrl:
          'https://lh3.googleusercontent.com/aida-public/AB6AXuCm4BOKHNPGZY0nzbH9ktD22ae4oIttpamXINmShulnPCBykrGdWiV2Rzy5EXIkB8wwon5xHaWbwlzIiYfCOBdhbaKQ64zOGPfW2-qXfCSsmx-Fh6E4NId7u54lTc3h1x6sM4XauLxoNvyv2FyUHHGjMZido5keG7Ye9tKmQFRBSJRcmz0JCYfalE7-IJpnluux7nxQoRk0E8UvZ7biBGxFMvuQl0VN1EBzb7BmO1zn6prhD_DRsi4R',
      backdropUrl:
          'https://lh3.googleusercontent.com/aida-public/AB6AXuCm4BOKHNPGZY0nzbH9ktD22ae4oIttpamXINmShulnPCBykrGdWiV2Rzy5EXIkB8wwon5xHaWbwlzIiYfCOBdhbaKQ64zOGPfW2-qXfCSsmx-Fh6E4NId7u54lTc3h1x6sM4XauLxoNvyv2FyUHHGjMZido5keG7Ye9tKmQFRBSJRcmz0JCYfalE7-IJpnluux7nxQoRk0E8UvZ7biBGxFMvuQl0VN1EBzb7BmO1zn6prhD_DRsi4R',
      videoUrl: sampleVideo1,
      matchScore: 95,
      ageRating: '13+',
      resolutionBadges: ['4K UHD'],
      genre: 'Baru Rilis',
      durationOrSeasons: '2 Jam 15 Min',
      releaseYear: 2022,
      director: 'Upi',
      cast: ['Pevita Pearce', 'Reza Rahadian'],
      isTop10: true,
      top10Rank: 2,
    ),
    const Movie(
      id: 'top_3',
      title: 'Nightmares & Daydreams',
      synopsis: 'Kumpulan misteri supernatural yang mengguncang Jakarta.',
      posterUrl:
          'https://lh3.googleusercontent.com/aida-public/AB6AXuAOGutFQ-DvSig2_a-ehAg0SwEYXCbStS9jKPxIlUEGac11aR6ArbEA73gbsOQeW3vseL9Ni99R5g8gLpKDEmXM6r65Z1pxupo6QM3Ay-0rnqiBrEaCmzSWyuVBfQDtuelWDovG50M53sMI0Wyh8pKhlY555gNQP3nQoLJtywCFZ3FDSYnXA6ww8vsGkm8-A0P6xeadwLcRvT22w25jTAFKIqORQRCbSztXiJIxMyLdsS_jYbeJNm0h',
      backdropUrl:
          'https://lh3.googleusercontent.com/aida-public/AB6AXuAOGutFQ-DvSig2_a-ehAg0SwEYXCbStS9jKPxIlUEGac11aR6ArbEA73gbsOQeW3vseL9Ni99R5g8gLpKDEmXM6r65Z1pxupo6QM3Ay-0rnqiBrEaCmzSWyuVBfQDtuelWDovG50M53sMI0Wyh8pKhlY555gNQP3nQoLJtywCFZ3FDSYnXA6ww8vsGkm8-A0P6xeadwLcRvT22w25jTAFKIqORQRCbSztXiJIxMyLdsS_jYbeJNm0h',
      videoUrl: sampleVideo2,
      matchScore: 96,
      ageRating: '18+',
      resolutionBadges: ['4K UHD'],
      genre: 'Trending #3',
      durationOrSeasons: '1 Musim',
      releaseYear: 2024,
      director: 'Joko Anwar',
      cast: ['Ario Bayu'],
      isTop10: true,
      top10Rank: 3,
    ),
    const Movie(
      id: 'top_4',
      title: 'Siksa Kubur',
      synopsis: 'Menemukan misteri kehidupan setelah mati.',
      posterUrl:
          'https://lh3.googleusercontent.com/aida-public/AB6AXuDySM2QF80YwYvVgxuS1EHEONYlbR_veTvdaMeVOCmaMIXvSk7kcCHgOJfyzAIRBdKPKslvII6nsesuk2Jrxnwvh3Vpn5qpt7qwECVUQYNwAlJNVEdC9pqt6wFoXODXp6fwynYefx8yxW9yD7WcDXvQ8cUlignXLMTDJNWNYk1cHxkCVLXQH8aNCLoXwz_NbulIebm5jjHPW5zYkqWs5yrL3rYul5CURveLxVkLd5drYANEUon_8Rx9',
      backdropUrl:
          'https://lh3.googleusercontent.com/aida-public/AB6AXuDySM2QF80YwYvVgxuS1EHEONYlbR_veTvdaMeVOCmaMIXvSk7kcCHgOJfyzAIRBdKPKslvII6nsesuk2Jrxnwvh3Vpn5qpt7qwECVUQYNwAlJNVEdC9pqt6wFoXODXp6fwynYefx8yxW9yD7WcDXvQ8cUlignXLMTDJNWNYk1cHxkCVLXQH8aNCLoXwz_NbulIebm5jjHPW5zYkqWs5yrL3rYul5CURveLxVkLd5drYANEUon_8Rx9',
      videoUrl: sampleVideo3,
      matchScore: 94,
      ageRating: '17+',
      resolutionBadges: ['4K UHD'],
      genre: 'Top Box Office',
      durationOrSeasons: '1 Jam 57 Min',
      releaseYear: 2024,
      director: 'Joko Anwar',
      cast: ['Faradina Mufti', 'Reza Rahadian'],
      isTop10: true,
      top10Rank: 4,
    ),
  ];

  static final List<Movie> actionSciFiMovies = [
    const Movie(
      id: 'as_1',
      title: 'Cyberpunk: Jakarta 2099',
      synopsis: 'Agen siber menembus hujan neon Jakarta masa depan.',
      posterUrl:
          'https://lh3.googleusercontent.com/aida-public/AB6AXuBlN--UlSbmVjzTLxb2o9qdL8Q8OhlaFHUBX3KHmBUwdWpmxhMzE8Q54ZWlrL5ll0oQNOjs-kACU6V4_P57Yn3ff8g41Saf8ne-6b2ggJU5WSTE2vdgg7S4FeewD0AMQDdcdFjE5JNvppE8Ovn3UFGtwwgFm4iy0COa4vwefzqCb9ocN2daeCE2CQJafAAcvok2g_rHBIuo5AamlS3uKXm0I7O_9OS5B5SsVl0ImjuIETKl_EzDOwVf',
      backdropUrl:
          'https://lh3.googleusercontent.com/aida-public/AB6AXuBlN--UlSbmVjzTLxb2o9qdL8Q8OhlaFHUBX3KHmBUwdWpmxhMzE8Q54ZWlrL5ll0oQNOjs-kACU6V4_P57Yn3ff8g41Saf8ne-6b2ggJU5WSTE2vdgg7S4FeewD0AMQDdcdFjE5JNvppE8Ovn3UFGtwwgFm4iy0COa4vwefzqCb9ocN2daeCE2CQJafAAcvok2g_rHBIuo5AamlS3uKXm0I7O_9OS5B5SsVl0ImjuIETKl_EzDOwVf',
      videoUrl: sampleVideo2,
      matchScore: 96,
      ageRating: '16+',
      resolutionBadges: ['HD'],
      genre: 'Distopia • Laga',
      durationOrSeasons: '1 Jam 48 Min',
      releaseYear: 2024,
      director: 'Kimo Stamboel',
      cast: ['Iko Uwais'],
      userRating: 8.9,
    ),
    const Movie(
      id: 'as_2',
      title: 'Singularitas Semesta',
      synopsis: 'Eksplorasi antariksa melintasi pusaran lubang hitam kosmik.',
      posterUrl:
          'https://lh3.googleusercontent.com/aida-public/AB6AXuAikLiErRcsy56tBDJR6NpGWNJ_bZcAgMT_Q1ZXWQ3eQjRuq8ZGKhlD9GhZAfftguTWs_gRGJzU3SyBxZ4oGMVuV1Lem0nODywhCkSHNiaRegl6chs-5HYM_EVTxs7E13A8nbtVWKnCMjrUffL9kqmGoM7XQGx16BQFT173WoWrazNBoakttisb1RjN58dgzxmGAr42G-195N3RY_3hHtgZnoSbBq56897HgM4Dsv9TOcyFG5j45DHZ',
      backdropUrl:
          'https://lh3.googleusercontent.com/aida-public/AB6AXuAikLiErRcsy56tBDJR6NpGWNJ_bZcAgMT_Q1ZXWQ3eQjRuq8ZGKhlD9GhZAfftguTWs_gRGJzU3SyBxZ4oGMVuV1Lem0nODywhCkSHNiaRegl6chs-5HYM_EVTxs7E13A8nbtVWKnCMjrUffL9kqmGoM7XQGx16BQFT173WoWrazNBoakttisb1RjN58dgzxmGAr42G-195N3RY_3hHtgZnoSbBq56897HgM4Dsv9TOcyFG5j45DHZ',
      videoUrl: sampleVideo3,
      matchScore: 92,
      ageRating: '13+',
      resolutionBadges: ['4K UHD'],
      genre: 'Sci-Fi • Eksplorasi',
      durationOrSeasons: '2 Jam 10 Min',
      releaseYear: 2023,
      director: 'Anggy Umbara',
      cast: ['Nicholas Saputra'],
      userRating: 8.7,
    ),
    const Movie(
      id: 'as_3',
      title: 'Operasi Serigala',
      synopsis: 'Regu komando elit melintasi reruntuhan hutan berkabut.',
      posterUrl:
          'https://lh3.googleusercontent.com/aida-public/AB6AXuD_YbiiJRuj56lNIptXYgUspLmr1SHw2ZnSBSN9piEPWD12IQlKNk6T-GI89X87pOjhTW_F2sefTWN8XoYOmhorctthkctuNbnpupZ3o3I2wvATFwDAyea9DNkBV0kwRwFTx4Osks-YQYLXlXPKa4rnv6cCW4u58G3MhY7rNcyoNQ7MWlz6zB1-VJlBQ673BfdcOZK6fNT35VNlUIyMPz4PqufLvHiUePzf_mD74zgovp38S_RwBa1b',
      backdropUrl:
          'https://lh3.googleusercontent.com/aida-public/AB6AXuD_YbiiJRuj56lNIptXYgUspLmr1SHw2ZnSBSN9piEPWD12IQlKNk6T-GI89X87pOjhTW_F2sefTWN8XoYOmhorctthkctuNbnpupZ3o3I2wvATFwDAyea9DNkBV0kwRwFTx4Osks-YQYLXlXPKa4rnv6cCW4u58G3MhY7rNcyoNQ7MWlz6zB1-VJlBQ673BfdcOZK6fNT35VNlUIyMPz4PqufLvHiUePzf_mD74zgovp38S_RwBa1b',
      videoUrl: sampleVideo4,
      matchScore: 95,
      ageRating: '18+',
      resolutionBadges: ['4K UHD'],
      genre: 'Militer • Taktis',
      durationOrSeasons: '1 Jam 55 Min',
      releaseYear: 2024,
      director: 'Timo Tjahjanto',
      cast: ['Joe Taslim'],
      userRating: 9.1,
    ),
    const Movie(
      id: 'as_4',
      title: 'Proyek Chimera',
      synopsis: 'Eksperimen biogenetik rahasia bawah tanah membangkitkan teror.',
      posterUrl:
          'https://lh3.googleusercontent.com/aida-public/AB6AXuAy2WLGJJP9ET31etUc7w-pH2oDdfXbO_Pl88hTXUH8cxrY2XVRfgLLj4PeKwbEzUaJiGyDkqiWZS4wq4JMTVeBISzlnqND1I0qgc49yjBt9HLTrM-0yDkkRdfTnsPyJ1aCr2_nx9BvYb1yzleUqbcWrnHos3AjGa5nFTqwi2Tf_vlHGT7jvn68_LzS7wFjlamj3w5rcykJFODoY-L-Yob0UAJ35cW-RZiLSWiPd71_vYONO2fcjES9',
      backdropUrl:
          'https://lh3.googleusercontent.com/aida-public/AB6AXuAy2WLGJJP9ET31etUc7w-pH2oDdfXbO_Pl88hTXUH8cxrY2XVRfgLLj4PeKwbEzUaJiGyDkqiWZS4wq4JMTVeBISzlnqND1I0qgc49yjBt9HLTrM-0yDkkRdfTnsPyJ1aCr2_nx9BvYb1yzleUqbcWrnHos3AjGa5nFTqwi2Tf_vlHGT7jvn68_LzS7wFjlamj3w5rcykJFODoY-L-Yob0UAJ35cW-RZiLSWiPd71_vYONO2fcjES9',
      videoUrl: sampleVideo1,
      matchScore: 90,
      ageRating: '17+',
      resolutionBadges: ['HD'],
      genre: 'Biopunk • Thriller',
      durationOrSeasons: '1 Jam 50 Min',
      releaseYear: 2024,
      director: 'Mike Wiluan',
      cast: ['Arifin Putra'],
      userRating: 8.4,
    ),
  ];

  static final List<Movie> searchCatalog = [
    const Movie(
      id: 'sc_1',
      title: 'The Shadow Protocol',
      synopsis: 'Tentara bayaran wanita bertarung di jalanan futuristik Jakarta.',
      posterUrl:
          'https://lh3.googleusercontent.com/aida-public/AB6AXuDjUvzHXgAxqCmLkjO222ISYXe8NpHB0dTRhGb3KIWWaP5cstzto2GdBJxGPYd81eIWbJBEYSAy-zRUmhd6bH1qKzEMdb54p4m3CjWYmbh4i3E8ohkxQiMxuynrvmDc5wRyqK_LC2Cxcpe3zltp4gD_39rg0qbkJO4OXbyvUDog7okUIPPx-J1-b5lavdjMxjWeJc4ffaxqZ55UwA5kobjkstDMMIeUlOuzICEtwP11kRFb-E0tyK5x',
      backdropUrl:
          'https://lh3.googleusercontent.com/aida-public/AB6AXuDjUvzHXgAxqCmLkjO222ISYXe8NpHB0dTRhGb3KIWWaP5cstzto2GdBJxGPYd81eIWbJBEYSAy-zRUmhd6bH1qKzEMdb54p4m3CjWYmbh4i3E8ohkxQiMxuynrvmDc5wRyqK_LC2Cxcpe3zltp4gD_39rg0qbkJO4OXbyvUDog7okUIPPx-J1-b5lavdjMxjWeJc4ffaxqZ55UwA5kobjkstDMMIeUlOuzICEtwP11kRFb-E0tyK5x',
      videoUrl: sampleVideo3,
      matchScore: 97,
      ageRating: '13+',
      resolutionBadges: ['4K UHD'],
      genre: 'Aksi, Sci-Fi',
      durationOrSeasons: '1 Jam 58 Min',
      releaseYear: 2024,
      director: 'Timo Tjahjanto',
      cast: ['Chelsea Islan', 'Iko Uwais'],
      userRating: 9.1,
    ),
    const Movie(
      id: 'sc_2',
      title: 'Apex: Orbit 9',
      synopsis: 'Pesawat monolitik mengorbit nebula violet dalam skala dramatis.',
      posterUrl:
          'https://lh3.googleusercontent.com/aida-public/AB6AXuBbeJmgf4xdC768NBNTblftuCUrJtkdfdnLRMNoQOR3SYfXSR2ir_mHYWhGowkIQyZZDIcWaELQoJmmh7C9_ztiE9Xj3SvVXsXvM1_2tHwA6astWcNZ1tebr5DpwXKTmQUv5L2ReXJxB8gzEaW8pexs-aHzcOEcVBvbmRiJHfw1ifodCh4YQuwo8OTW1-Kq7uBxzxsaCRyy7P9392BAItn1N8w15taG47_Z6YUM_AfNGUrij4llhU9p',
      backdropUrl:
          'https://lh3.googleusercontent.com/aida-public/AB6AXuBbeJmgf4xdC768NBNTblftuCUrJtkdfdnLRMNoQOR3SYfXSR2ir_mHYWhGowkIQyZZDIcWaELQoJmmh7C9_ztiE9Xj3SvVXsXvM1_2tHwA6astWcNZ1tebr5DpwXKTmQUv5L2ReXJxB8gzEaW8pexs-aHzcOEcVBvbmRiJHfw1ifodCh4YQuwo8OTW1-Kq7uBxzxsaCRyy7P9392BAItn1N8w15taG47_Z6YUM_AfNGUrij4llhU9p',
      videoUrl: sampleVideo2,
      matchScore: 95,
      ageRating: '16+',
      resolutionBadges: ['4K'],
      genre: 'Sci-Fi, Luar Angkasa',
      durationOrSeasons: '2 Jam 05 Min',
      releaseYear: 2023,
      director: 'Angga Sasongko',
      cast: ['Reza Rahadian', 'Dian Sastro'],
      userRating: 8.8,
    ),
    const Movie(
      id: 'sc_3',
      title: 'Singa Baja Nusantara',
      synopsis: 'Pejuang berzirah eksoskeleton taktis dalam pertempuran berkabut.',
      posterUrl:
          'https://lh3.googleusercontent.com/aida-public/AB6AXuBT4TyILsRPKIpcXoaPlN5u-nDCyz-5QsNaUmPPzuEocM9oOxUlzDWb-v2tT7mZF4ihm5-0va_hz1PJTvwrUrYU2D0uxLxMPCEdtSgGdLgUiIF7DicgupqdvHTLguFhLJfOa8XAw8gW3roxWbrrOxr6P8vdr0Td94szrvO2baNvNfCgtLUvKPxdWSFA9rizyzvfnEhVbYKHr7zSNBATrhpgOjiRGfzdCixybeuEcMW2N5TGZOGi_8M3',
      backdropUrl:
          'https://lh3.googleusercontent.com/aida-public/AB6AXuBT4TyILsRPKIpcXoaPlN5u-nDCyz-5QsNaUmPPzuEocM9oOxUlzDWb-v2tT7mZF4ihm5-0va_hz1PJTvwrUrYU2D0uxLxMPCEdtSgGdLgUiIF7DicgupqdvHTLguFhLJfOa8XAw8gW3roxWbrrOxr6P8vdr0Td94szrvO2baNvNfCgtLUvKPxdWSFA9rizyzvfnEhVbYKHr7zSNBATrhpgOjiRGfzdCixybeuEcMW2N5TGZOGi_8M3',
      videoUrl: sampleVideo4,
      matchScore: 93,
      ageRating: '18+',
      resolutionBadges: ['4K'],
      genre: 'Aksi, Thriller',
      durationOrSeasons: '2 Jam 12 Min',
      releaseYear: 2024,
      director: 'Kimo Stamboel',
      cast: ['Yayan Ruhian', 'Cecep Arif Rahman'],
      userRating: 8.9,
    ),
    const Movie(
      id: 'sc_4',
      title: 'Chrono Void',
      synopsis: 'Detektif sibernetik mengungkap anomali waktu bawah tanah.',
      posterUrl:
          'https://lh3.googleusercontent.com/aida-public/AB6AXuBU0a7GQ4iCtQowlMNVwWwKJFDJd-Twc2S8xlEgCKdrK7vEDL8illssRbZWSrzYMwMSeJt6ICoxdD1Cx3eEVuNGfogyqdqWe2T_5H-rDrxvposOScMrHboeXXJ-CkUbQaI2SZvFgcIbY-OCY5s4cGER89t8QyLf0onJ0_kYM3fh3-ROaG-RgIttN10TVS02piCYmO7BaBkk3V_Lg_QLmE7oGKZz5kGELqg-3JkheTB9gjjm9xj7MmCG',
      backdropUrl:
          'https://lh3.googleusercontent.com/aida-public/AB6AXuBU0a7GQ4iCtQowlMNVwWwKJFDJd-Twc2S8xlEgCKdrK7vEDL8illssRbZWSrzYMwMSeJt6ICoxdD1Cx3eEVuNGfogyqdqWe2T_5H-rDrxvposOScMrHboeXXJ-CkUbQaI2SZvFgcIbY-OCY5s4cGER89t8QyLf0onJ0_kYM3fh3-ROaG-RgIttN10TVS02piCYmO7BaBkk3V_Lg_QLmE7oGKZz5kGELqg-3JkheTB9gjjm9xj7MmCG',
      videoUrl: sampleVideo1,
      matchScore: 91,
      ageRating: '13+',
      resolutionBadges: ['HDR'],
      genre: 'Aksi, Sci-Fi',
      durationOrSeasons: '1 Jam 45 Min',
      releaseYear: 2023,
      director: 'Joko Anwar',
      cast: ['Ario Bayu', 'Laura Basuki'],
      userRating: 8.5,
    ),
  ];

  static final List<Movie> similarMovies = [
    const Movie(
      id: 'sim_1',
      title: 'Bumi Manusia',
      synopsis: 'Kisah perjuangan Minke di era kolonial Hindia Belanda.',
      posterUrl:
          'https://lh3.googleusercontent.com/aida-public/AB6AXuDWMSGqBRrhngi4kAUyxNdhjTj31AtVxrEfoyGsWlAns0zlDS8iUZRUvP8fUkyMaiXTnKs_XW5XcYVLSv7L5PhIUzSoAz31IGsXSOwi3zZyBTK_wqQagiE0dJXmp5FwyRSIwWCH8zjMt2lyzvYPpmYS029Igw29kRs0tcqMmbc4RHTA40SUVkh-GJhi8EulIetEx5DtmaAj7DH9_9dhV6VDeHXbXvP5BHraVcaT2gAK0Pz1yEA-za3B',
      backdropUrl:
          'https://lh3.googleusercontent.com/aida-public/AB6AXuDWMSGqBRrhngi4kAUyxNdhjTj31AtVxrEfoyGsWlAns0zlDS8iUZRUvP8fUkyMaiXTnKs_XW5XcYVLSv7L5PhIUzSoAz31IGsXSOwi3zZyBTK_wqQagiE0dJXmp5FwyRSIwWCH8zjMt2lyzvYPpmYS029Igw29kRs0tcqMmbc4RHTA40SUVkh-GJhi8EulIetEx5DtmaAj7DH9_9dhV6VDeHXbXvP5BHraVcaT2gAK0Pz1yEA-za3B',
      videoUrl: sampleVideo1,
      matchScore: 96,
      ageRating: '13+',
      resolutionBadges: ['4K UHD'],
      genre: 'Film • 2019',
      durationOrSeasons: '3 Jam',
      releaseYear: 2019,
      director: 'Hanung Bramantyo',
      cast: ['Iqbaal Ramadhan', 'Mawar de Jongh'],
    ),
    const Movie(
      id: 'sim_2',
      title: 'The Night Comes For Us',
      synopsis: 'Pertarungan hidup mati anggota triad di Jakarta.',
      posterUrl:
          'https://lh3.googleusercontent.com/aida-public/AB6AXuDNnXx3TwvkUxflYwFegvsPJrzAnzUZXAwRK7U_2n0ecSvs2xS8_fT-qosBqxBgBKorPxDFfY3PuTFafmX7iIkWZHBBdaf88MMZgWY2GJgmIP2K2fBsxFvLONgOjVG9itW9e-HI3-1AUxliIPgLORxpTrE8V_ZqD9PVsNLOkULnjdrauBQrjxA1W0drJKWxiKFWXu0nbx83NFPZIVkDKZtLmXw8q_HHD_G4-xzAiMa_Q-06QGsKxiFr',
      backdropUrl:
          'https://lh3.googleusercontent.com/aida-public/AB6AXuDNnXx3TwvkUxflYwFegvsPJrzAnzUZXAwRK7U_2n0ecSvs2xS8_fT-qosBqxBgBKorPxDFfY3PuTFafmX7iIkWZHBBdaf88MMZgWY2GJgmIP2K2fBsxFvLONgOjVG9itW9e-HI3-1AUxliIPgLORxpTrE8V_ZqD9PVsNLOkULnjdrauBQrjxA1W0drJKWxiKFWXu0nbx83NFPZIVkDKZtLmXw8q_HHD_G4-xzAiMa_Q-06QGsKxiFr',
      videoUrl: sampleVideo3,
      matchScore: 94,
      ageRating: '21+',
      resolutionBadges: ['4K UHD'],
      genre: 'Aksi • 2018',
      durationOrSeasons: '2 Jam',
      releaseYear: 2018,
      director: 'Timo Tjahjanto',
      cast: ['Joe Taslim', 'Iko Uwais'],
    ),
    const Movie(
      id: 'sim_3',
      title: 'Perempuan Tanah Jahanam',
      synopsis: 'Warisan rumah misterius di pedalaman desa terkutuk.',
      posterUrl:
          'https://lh3.googleusercontent.com/aida-public/AB6AXuDa4c-1RqnFllKnOwkJWuwWn4qWml70tjOuRGNF5J1xoGiJVEy3EtlGV1tjc0ckxRJrhJYbLhZ9vZlsnYNvhIv6AcTGAsvVWhfJ1wP_yLYKh5VnqIEIlUYu8ZApOVYX8ndu3v1TfLOifBR76SfvhQBt7hE01BW1DyllOaIkI8rvINUb4WmiT8_L1myWn_ZVcrxoblPJXouiVk9Dfjn65AP2XVLceEnwWOYjQkicH_MIoYo_rSR7sj4E',
      backdropUrl:
          'https://lh3.googleusercontent.com/aida-public/AB6AXuDa4c-1RqnFllKnOwkJWuwWn4qWml70tjOuRGNF5J1xoGiJVEy3EtlGV1tjc0ckxRJrhJYbLhZ9vZlsnYNvhIv6AcTGAsvVWhfJ1wP_yLYKh5VnqIEIlUYu8ZApOVYX8ndu3v1TfLOifBR76SfvhQBt7hE01BW1DyllOaIkI8rvINUb4WmiT8_L1myWn_ZVcrxoblPJXouiVk9Dfjn65AP2XVLceEnwWOYjQkicH_MIoYo_rSR7sj4E',
      videoUrl: sampleVideo2,
      matchScore: 98,
      ageRating: '17+',
      resolutionBadges: ['4K UHD'],
      genre: 'Horor • 2019',
      durationOrSeasons: '1 Jam 46 Min',
      releaseYear: 2019,
      director: 'Joko Anwar',
      cast: ['Tara Basro', 'Marissa Anita'],
    ),
    const Movie(
      id: 'sim_4',
      title: 'Kartini',
      synopsis: 'Perjuangan emansipasi dan pendidikan perempuan tanah Jawa.',
      posterUrl:
          'https://lh3.googleusercontent.com/aida-public/AB6AXuD203SR4a0dyI98Xh1PRfIZPRp7-VBpndDAptJ-tCLp9mGdbQoHhBnrZGG2CMUFd7Ve8EDcQpGXhqvSGU4GxC8gAzxmDNXdN7MeW1mPCweujjJ5R-fTIkHKG7sOdo7e_sOOJoEooj1DY55qgILNtA-z6GckR4OXsAlpvEjIF93ewNB2JD4W2on0PZzAnHVGhf26kPxR69bM44M7kLzWQ8OWMkMod0c4ZekmO0y9i4jXIzCEwsnj-BNn',
      backdropUrl:
          'https://lh3.googleusercontent.com/aida-public/AB6AXuD203SR4a0dyI98Xh1PRfIZPRp7-VBpndDAptJ-tCLp9mGdbQoHhBnrZGG2CMUFd7Ve8EDcQpGXhqvSGU4GxC8gAzxmDNXdN7MeW1mPCweujjJ5R-fTIkHKG7sOdo7e_sOOJoEooj1DY55qgILNtA-z6GckR4OXsAlpvEjIF93ewNB2JD4W2on0PZzAnHVGhf26kPxR69bM44M7kLzWQ8OWMkMod0c4ZekmO0y9i4jXIzCEwsnj-BNn',
      videoUrl: sampleVideo1,
      matchScore: 91,
      ageRating: '13+',
      resolutionBadges: ['HD'],
      genre: 'Biografi • 2017',
      durationOrSeasons: '1 Jam 59 Min',
      releaseYear: 2017,
      director: 'Hanung Bramantyo',
      cast: ['Dian Sastrowardoyo'],
    ),
    const Movie(
      id: 'sim_5',
      title: 'Layangan Putus',
      synopsis: 'Dilema rumah tangga dan ujian kesetiaan di tengah badai cinta.',
      posterUrl:
          'https://lh3.googleusercontent.com/aida-public/AB6AXuAOCoKNnSmoicAZv_rvIg08hf-a0h1kzz76QqteLVgYfcR9xOkY8SPyHUabZR88TFtI1ApmRtwvALqUYbtY4syiqMTh7z8pR6avVX4CEvZov1Gfbv8qDJ3gJf-kXvdDwGUmNj2nr6rPpFsUX4gNN0YFCOKq6XqcXfcV14b3Zp6n1PL6zHS_HyDx3HdtXCstTNfnsVs_Sr-xA8YH4y793s8Z-_egrkglVyNrVEymKDrj9Jh9f2SiFSkp',
      backdropUrl:
          'https://lh3.googleusercontent.com/aida-public/AB6AXuAOCoKNnSmoicAZv_rvIg08hf-a0h1kzz76QqteLVgYfcR9xOkY8SPyHUabZR88TFtI1ApmRtwvALqUYbtY4syiqMTh7z8pR6avVX4CEvZov1Gfbv8qDJ3gJf-kXvdDwGUmNj2nr6rPpFsUX4gNN0YFCOKq6XqcXfcV14b3Zp6n1PL6zHS_HyDx3HdtXCstTNfnsVs_Sr-xA8YH4y793s8Z-_egrkglVyNrVEymKDrj9Jh9f2SiFSkp',
      videoUrl: sampleVideo4,
      matchScore: 95,
      ageRating: '17+',
      resolutionBadges: ['FHD'],
      genre: 'Drama • 2021',
      durationOrSeasons: '1 Musim',
      releaseYear: 2021,
      director: 'Benni Setiawan',
      cast: ['Reza Rahadian', 'Putri Marino'],
    ),
    const Movie(
      id: 'sim_6',
      title: 'Serigala Terakhir',
      synopsis: 'Dunia hitam mafia bawah tanah dan persahabatan yang retak.',
      posterUrl:
          'https://lh3.googleusercontent.com/aida-public/AB6AXuAH38ldxl7m86svA7pFeqWp9EofRMPAqZ8nkUsRxs6-Rv-eh1DJenQKjKaHoc3C1Cphe2qeRNb0njHo_YktlzJeUgBTTbc2id0t6J37d1tjOLTwsVx5XNbJY_amLH8zLjE4sXrjULskrdGBC3uBtnsKa0PrVPhEknei4Z65pBs4t1ZF4htGdugFnOuwaxzH9gt9b3r9ziOk6T5WsWQYleq_MHFMasEFBDDa7gRX3J2AczseShcUsyE7',
      backdropUrl:
          'https://lh3.googleusercontent.com/aida-public/AB6AXuAH38ldxl7m86svA7pFeqWp9EofRMPAqZ8nkUsRxs6-Rv-eh1DJenQKjKaHoc3C1Cphe2qeRNb0njHo_YktlzJeUgBTTbc2id0t6J37d1tjOLTwsVx5XNbJY_amLH8zLjE4sXrjULskrdGBC3uBtnsKa0PrVPhEknei4Z65pBs4t1ZF4htGdugFnOuwaxzH9gt9b3r9ziOk6T5WsWQYleq_MHFMasEFBDDa7gRX3J2AczseShcUsyE7',
      videoUrl: sampleVideo3,
      matchScore: 89,
      ageRating: '18+',
      resolutionBadges: ['HD'],
      genre: 'Aksi • 2020',
      durationOrSeasons: '1 Musim',
      releaseYear: 2020,
      director: 'Tommy Dewo',
      cast: ['Abimana Aryasatya'],
    ),
    const Movie(
      id: 'sim_7',
      title: 'Agak Laen',
      synopsis: 'Empat sekawan penjaga rumah hantu pasar malam panik setelah seorang politisi meninggal mendadak di dalam wahana mereka.',
      posterUrl:
          'https://lh3.googleusercontent.com/aida-public/AB6AXuCvSAQfk73Ost_BO_5v-5pKB3ePUfLHybc-BP-j2rlfrzeFouYyXy_BlM-xcZ7j3jW86DKQbxdGQaSsn2wmK3-_-vCJk-xreLuxncjWjBMVxW-FR9Zw5tPyfDda22YTrXZN3KRrZoe7uraGsrMOCP_aYuZD8J8DFYJ1PZ57B_N0iwxeVTgkM3ZD8gaRpHGGUVqGlerbMmGxpoo-wWAYTrIGkC-03QwexPqNyB08ZehAL7w0oDPDV9bC',
      backdropUrl:
          'https://lh3.googleusercontent.com/aida-public/AB6AXuCvSAQfk73Ost_BO_5v-5pKB3ePUfLHybc-BP-j2rlfrzeFouYyXy_BlM-xcZ7j3jW86DKQbxdGQaSsn2wmK3-_-vCJk-xreLuxncjWjBMVxW-FR9Zw5tPyfDda22YTrXZN3KRrZoe7uraGsrMOCP_aYuZD8J8DFYJ1PZ57B_N0iwxeVTgkM3ZD8gaRpHGGUVqGlerbMmGxpoo-wWAYTrIGkC-03QwexPqNyB08ZehAL7w0oDPDV9bC',
      videoUrl: sampleVideo1,
      matchScore: 98,
      ageRating: '13+',
      resolutionBadges: ['4K UHD'],
      genre: 'Komedi • Horor',
      durationOrSeasons: '1 Jam 59 Min',
      releaseYear: 2024,
      director: 'Muhadkly Acho',
      cast: ['Bene Dion', 'Boris Bokir', 'Indra Jegel', 'Oki Rengga'],
      userRating: 9.2,
    ),
    const Movie(
      id: 'sim_8',
      title: 'Si Juki The Movie: Harta Pulau Monyet',
      synopsis: 'Juki dan kawan-kawan berlayar menemukan peta harta karun misterius peninggalan nenek moyang demi menyelamatkan kampung.',
      posterUrl:
          'https://lh3.googleusercontent.com/aida-public/AB6AXuBlN--UlSbmVjzTLxb2o9qdL8Q8OhlaFHUBX3KHmBUwdWpmxhMzE8Q54ZWlrL5ll0oQNOjs-kACU6V4_P57Yn3ff8g41Saf8ne-6b2ggJU5WSTE2vdgg7S4FeewD0AMQDdcdFjE5JNvppE8Ovn3UFGtwwgFm4iy0COa4vwefzqCb9ocN2daeCE2CQJafAAcvok2g_rHBIuo5AamlS3uKXm0I7O_9OS5B5SsVl0ImjuIETKl_EzDOwVf',
      backdropUrl:
          'https://lh3.googleusercontent.com/aida-public/AB6AXuBlN--UlSbmVjzTLxb2o9qdL8Q8OhlaFHUBX3KHmBUwdWpmxhMzE8Q54ZWlrL5ll0oQNOjs-kACU6V4_P57Yn3ff8g41Saf8ne-6b2ggJU5WSTE2vdgg7S4FeewD0AMQDdcdFjE5JNvppE8Ovn3UFGtwwgFm4iy0COa4vwefzqCb9ocN2daeCE2CQJafAAcvok2g_rHBIuo5AamlS3uKXm0I7O_9OS5B5SsVl0ImjuIETKl_EzDOwVf',
      videoUrl: sampleVideo2,
      matchScore: 93,
      ageRating: 'SU',
      resolutionBadges: ['FHD 1080p'],
      genre: 'Animasi • Petualangan',
      durationOrSeasons: '1 Jam 47 Min',
      releaseYear: 2024,
      director: 'Faza Meonk',
      cast: ['Faza Meonk', 'Indro Warkop', 'Jaja Mihardja'],
      userRating: 8.6,
    ),
    const Movie(
      id: 'sim_9',
      title: 'Rencana Besar',
      synopsis: 'Penggelapan dana 17 miliar di bank terkemuka membongkar skandal konspirasi elite politik dan kekuasaan korup.',
      posterUrl:
          'https://lh3.googleusercontent.com/aida-public/AB6AXuDySM2QF80YwYvVgxuS1EHEONYlbR_veTvdaMeVOCmaMIXvSk7kcCHgOJfyzAIRBdKPKslvII6nsesuk2Jrxnwvh3Vpn5qpt7qwECVUQYNwAlJNVEdC9pqt6wFoXODXp6fwynYefx8yxW9yD7WcDXvQ8cUlignXLMTDJNWNYk1cHxkCVLXQH8aNCLoXwz_NbulIebm5jjHPW5zYkqWs5yrL3rYul5CURveLxVkLd5drYANEUon_8Rx9',
      backdropUrl:
          'https://lh3.googleusercontent.com/aida-public/AB6AXuDySM2QF80YwYvVgxuS1EHEONYlbR_veTvdaMeVOCmaMIXvSk7kcCHgOJfyzAIRBdKPKslvII6nsesuk2Jrxnwvh3Vpn5qpt7qwECVUQYNwAlJNVEdC9pqt6wFoXODXp6fwynYefx8yxW9yD7WcDXvQ8cUlignXLMTDJNWNYk1cHxkCVLXQH8aNCLoXwz_NbulIebm5jjHPW5zYkqWs5yrL3rYul5CURveLxVkLd5drYANEUon_8Rx9',
      videoUrl: sampleVideo4,
      matchScore: 94,
      ageRating: '16+',
      resolutionBadges: ['4K UHD'],
      genre: 'Drama • Kriminal',
      durationOrSeasons: '1 Musim (6 Episode)',
      releaseYear: 2023,
      director: 'Danial Rifki',
      cast: ['Dwi Sasono', 'Adipati Dolken', 'Prisia Nasution'],
      userRating: 8.8,
    ),
  ];

  static List<Movie> get popularMovies => similarMovies;

  static final List<Episode> gadiskretekEpisodes = [
    const Episode(
      id: 'gk_ep1',
      episodeNumber: 1,
      seasonNumber: 1,
      title: '1. Jeng Yah',
      duration: '58m',
      synopsis:
          'Permintaan sekarat seorang pengusaha tembakau kaya memicu pencarian putranya untuk melacak Jeng Yah, wanita misterius dari masa lalunya.',
      thumbnailUrl:
          'https://lh3.googleusercontent.com/aida-public/AB6AXuASivXIYBrwhwGkyYhe_F7Xivw-wk8fE0SWmAB4nD4u7UiVhY_kj4F5s4gJG7Xb_hvpAjIqZDjmmWJjDgtyE2oF252-WWeltUq9hgk6TwclY3i6GMf_sJAGps_flt_vhja9Uevg-0rCtToUUKmuB09XtOHaeYd719i6yDu_bjjBX1CkXZsfEEQ9EDdvoL-0BS2TetZ6l17VejeTt0NK6FrigvZ9WwF_M6lb8uecxWDPgPje34B3SYdF',
      videoUrl: sampleVideo1,
      progress: 0.75,
    ),
    const Episode(
      id: 'gk_ep2',
      episodeNumber: 2,
      seasonNumber: 1,
      title: '2. Mawar Merah',
      duration: '62m',
      synopsis:
          'Bakat istimewa Dasiyah meramu saus kretek membangkitkan kekaguman pemuda pendatang bernama Raja, namun rasa iri mulai merebak di pabrik.',
      thumbnailUrl:
          'https://lh3.googleusercontent.com/aida-public/AB6AXuBwIen0zUqhud03YGOQcvFUiGYRnlomWOe6HOEG-S_g1dzdOdpPGuq_hqAqtaxxOgr9P2Yz1mMf5G9AmfeDvoYcuQcFfPRLKAmqr0eiwlKy1fw2gi-cUBbA7ybn-VEZkvoviNzOENgRXSK8EUQpHaauWwA2A7HXU8PZW6URi_GDY_b5MkWvJOI5M928D94BrPFvHw-N6Zkwm06hDRlKqTi5SK9jReDW2bIxSiEteaH6NbEyZCgF4oUF',
      videoUrl: sampleVideo2,
      progress: 0.0,
    ),
    const Episode(
      id: 'gk_ep3',
      episodeNumber: 3,
      seasonNumber: 1,
      title: '3. Rahasia Saus',
      duration: '59m',
      synopsis:
          'Sebuah formula racikan baru memicu persaingan sengit antarkeluarga juragan tembakau ketika gejolak politik mulai mengancam desa.',
      thumbnailUrl:
          'https://lh3.googleusercontent.com/aida-public/AB6AXuDT8ajlDFs_2no8-pAMsy-l2bquXMdTeKPJKOT3Rql9hQUD8GSrPK0fgMhvT2avyL6FuHJVJlvBEXH9rtJa2-Dma9f4VG-4bxkag84QA3D0DMToUHTifU71t02JH_gD6t2VDjbhx3hWx1tXGeOVAUCyTay79Jxc0q62B8rJNLOqKYfl4v9NI3gMlN6b7zcNEZHLCogfNdVubLLDK4ruHI5GlBbvGaVlJ2KuNm79wGub6ugSs0jJMOzw',
      videoUrl: sampleVideo3,
      progress: 0.0,
    ),
    const Episode(
      id: 'gk_ep4',
      episodeNumber: 4,
      seasonNumber: 1,
      title: '4. Pengkhianatan',
      duration: '64m',
      synopsis:
          'Peristiwa tak terduga memisahkan Dasiyah dan Raja. Di masa kini, Lebas dan Arum kian dekat menemukan lokasi persembunyian Jeng Yah.',
      thumbnailUrl:
          'https://lh3.googleusercontent.com/aida-public/AB6AXuCnG8bNKrVZ3MK5eLbSdCt5MAddYkHYSfWHx1_ZTVHa57TbIo9A9Oq5xTlbE8_bJrk5UDkMs4W31cXVEA2PHGccQZF5nXh1y-YOPtpJJBQ31t3c2yP_oJDiN1rrMY2LeDU2skFYXPafeRTmVLrud6l7cmWmW-fhsKzkXCg32uNANmPV-q0rc5svmkSX9SrRhJFGyXKmoS_IlKljaRxRlWEPTOHEL_25WqGuCeMkrAOnLF1q7KaBrY1M',
      videoUrl: sampleVideo4,
      progress: 0.0,
    ),
    const Episode(
      id: 'gk_ep5',
      episodeNumber: 5,
      seasonNumber: 1,
      title: '5. Gadis Kretek (Final)',
      duration: '70m',
      synopsis:
          'Semua kebenaran yang tertimbun puluhan tahun terungkap, melahirkan pengampunan yang membebaskan dua generasi dari belenggu masa lalu.',
      thumbnailUrl:
          'https://lh3.googleusercontent.com/aida-public/AB6AXuAX8fyIZYj5EqWVRa-58r_Yid6PqOab8Scq8ihijFFTi4GjdlCqTNxluhAMMYnpYXLZEOTy5UnY7_zHcEL07YecTSn0MiDqD-oYujbVnziP5sbL_BsuDl1WZTLHt4CG6dJyWJ0h8UvQP6FehmvuahqgkBcPteuC8H9cndR2dzabY_0n8b1WIkj0nw0RR_kK5f_VPv90ZbMhDT1ge857B7hRwvR6gqUWMq5yno2F2MuEueRIkE7AglVK',
      videoUrl: sampleVideo1,
      progress: 0.0,
    ),
  ];

  static final List<Review> gadiskretekReviews = [
    Review(
      id: 'r1',
      userName: 'Reza Anindita',
      userAvatarUrl:
          'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=120&q=80',
      rating: 10.0,
      comment:
          'Akting Dian Sastro sebagai Jeng Yah adalah mahakarya seni peran Indonesia. Sinematografi dan kostum kebaya era 60-annya luar biasa otentik sampai ke detail aroma cengkeh yang seolah tercium lewat layar!',
      createdAt: DateTime.now().subtract(const Duration(days: 2)),
      likesCount: 142,
    ),
    Review(
      id: 'r2',
      userName: 'Bagas Pratama',
      userAvatarUrl:
          'https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?auto=format&fit=crop&w=120&q=80',
      rating: 9.0,
      comment:
          'Pacing episode 1 sampai 3 sangat rapi. Musik latarnya bikin merinding, transisi antara masa lalu dan masa kini lewat sudut pandang Lebas dan Arum mengikat alur cerita dengan elegan.',
      createdAt: DateTime.now().subtract(const Duration(days: 7)),
      likesCount: 89,
    ),
    Review(
      id: 'r3',
      userName: 'Siti Wulandari',
      userAvatarUrl:
          'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=120&q=80',
      rating: 9.5,
      comment:
          'Selesai nonton langsung ingin baca ulang novel Ratih Kumala. Kamila Andini berhasil menerjemahkan jiwa bukunya ke layar dengan sangat puitis dan berani.',
      createdAt: DateTime.now().subtract(const Duration(days: 14)),
      likesCount: 54,
    ),
  ];

  static List<Movie> getAllMovies() {
    final Map<String, Movie> map = {};
    for (final m in [
      ...heroMovies,
      ...top10Movies,
      ...continueWatchingList,
      ...popularMovies,
      ...actionSciFiMovies,
      ...similarMovies,
    ]) {
      map[m.id] = m;
    }
    return map.values.toList();
  }

  static Movie? getMovieById(String id) {
    final movies = getAllMovies();
    for (final m in movies) {
      if (m.id == id) return m;
    }
    return null;
  }
}
