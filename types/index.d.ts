export interface ExtendObject {
  [key: string]: any
}

export interface RouteOptions {
  homePage?: string
}

export interface RouteParams extends ExtendObject {
  url: string,
  query?: ExtendObject
}
