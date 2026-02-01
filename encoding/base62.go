package encoding

const digits = "0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ"

func EncodeBase62(n int64) string {
	if n == 0 {
		return "0"
	}
	b := make([]byte, 0, 11)
	for n > 0 {
		b = append(b, digits[n%62])
		n /= 62
	}
	for i, j := 0, len(b)-1; i < j; i, j = i+1, j-1 {
		b[i], b[j] = b[j], b[i]
	}
	return string(b)
}

func DecodeBase62(s string) (int64, error) {
	var v int64
	for i := 0; i < len(s); i++ {
		c := s[i]
		var idx int64
		switch {
		case c >= '0' && c <= '9':
			idx = int64(c - '0')
		case c >= 'a' && c <= 'z':
			idx = int64(c-'a') + 10
		case c >= 'A' && c <= 'Z':
			idx = int64(c-'A') + 36
		default:
			return 0, nil
		}
		v = v*62 + idx
	}
	return v, nil
}
