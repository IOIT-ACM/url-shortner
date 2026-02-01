package encoding

import (
	"crypto/rand"
	"encoding/binary"
	"fmt"
	"log"
)

var obfuscationSecret uint64

func InitObfuscation(secret string) error {
	if secret == "" {
		b := make([]byte, 8)
		if _, err := rand.Read(b); err != nil {
			return err
		}
		obfuscationSecret = binary.BigEndian.Uint64(b)
		log.Printf("Generated obfuscation secret: %016x", obfuscationSecret)
		return nil
	}

	_, err := fmt.Sscanf(secret, "%x", &obfuscationSecret)
	return err
}

func ObfuscateID(id int64) int64 {
	v := uint64(id) ^ obfuscationSecret
	return int64((v << 21) | (v >> (64 - 21)))
}

func DeobfuscateID(v int64) int64 {
	uv := uint64(v)
	rotated := (uv >> 21) | (uv << (64 - 21))
	return int64(rotated ^ obfuscationSecret)
}
