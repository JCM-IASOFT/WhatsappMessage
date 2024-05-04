export interface ResponseWtsp {
    fromMe: boolean,
    remote: Remote,
    id: string,
    self: string,
    _serialized: string
}

interface Remote {
    server: string,
    user: string,
    _serialized: string
}