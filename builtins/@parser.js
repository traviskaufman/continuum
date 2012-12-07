export function parse(src, { loc, source, line, builder } = { loc: true, source: null, line: 1, builder: null }){
  return $__Parse(src, loc, source, line, builder);
}
