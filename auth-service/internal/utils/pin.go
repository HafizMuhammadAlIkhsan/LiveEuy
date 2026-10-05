package utils

import (
	"crypto/rand"
	"math/big"
	"strconv"
)

func GenerateOTP(length int) (string, error) {
	otp := ""
	for i := 0; i < length; i++ {
		num, err := rand.Int(rand.Reader, big.NewInt(10))
		if err != nil {
			return "", err
		}
		otp += strconv.Itoa(int(num.Int64()))
	}
	return otp, nil
}