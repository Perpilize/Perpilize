BINARY=perpilized

all: build

build:
	go build -o build/$(BINARY) ./cmd/$(BINARY)

install:
	go install ./cmd/$(BINARY)

clean:
	rm -rf build/

test:
	go test ./... -v	