export function parseEvent(ev: any) {
  const type = ev.type

  const attrs: any = {}
  ev.attributes.forEach((a: any) => {
    attrs[a.key] = a.value
  })

  return {
    type,
    ...attrs
  }
}