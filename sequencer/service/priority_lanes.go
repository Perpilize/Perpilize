package service

func AssignPriority(o *Order) {
    switch {
    case o.Size > 100000:
        o.Priority = 1 
    default:
        o.Priority = 2
    }
}