package margin

// handler.go is intentionally minimal in SDK v0.50.
// Message routing is handled by the MsgServiceRouter via RegisterServices().
// Legacy sdk.Handler is no longer supported.
// All message handling goes through x/margin/keeper/msg_server.go