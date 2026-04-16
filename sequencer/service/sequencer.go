package service

import (
    "sync"
)

type Order struct {
    Trader   string
    Market   string
    Size     float64
    Price    float64
    Side     string
    Priority int
}

type Sequencer struct {
    mu     sync.Mutex
    mempool []Order
}

func NewSequencer() *Sequencer {
    return &Sequencer{
        mempool: []Order{},
    }
}

func (s *Sequencer) SubmitOrder(o Order) {
    s.mu.Lock()
    defer s.mu.Unlock()

    s.mempool = append(s.mempool, o)
}

func (s *Sequencer) BuildBlock() []Order {
    s.mu.Lock()
    defer s.mu.Unlock()

    orders := s.mempool
    s.mempool = []Order{}

    // deterministic ordering
    // sort by priority + timestamp (simplified)
    return orders
}