export type Client = {
  id: string
  name: string
}

export type ClientListResponse = {
  items: Client[]
  totalCount: number
  page: number
  pageSize: number
}
