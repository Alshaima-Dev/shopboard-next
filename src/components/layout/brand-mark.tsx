const ribbonPaths = [
  "M81 60C62 18 40 2 20 9C0 15 3 39 20 51C38 65 59 68 81 60ZM74 56C55 65 36 58 22 47C8 35 5 16 21 11C40 4 59 30 74 56Z",
  "M79 60C98 18 120 2 140 9C160 15 157 39 140 51C122 65 101 68 79 60ZM86 56C105 65 124 58 138 47C152 35 155 16 139 11C120 4 101 30 86 56Z",
  "M75 52C91 91 98 114 120 118C100 118 90 100 80 75C70 51 60 29 47 17C60 25 68 39 75 52Z",
  "M85 52C69 91 62 114 40 118C60 118 70 100 80 75C90 51 100 29 113 17C100 25 92 39 85 52Z",
];

export function BrandMark({ className }: { className: string }) {
  return <svg viewBox="0 0 160 128" fill="currentColor" aria-hidden="true" focusable="false" className={className}>{ribbonPaths.map(d => <path key={d} d={d} fillRule="evenodd" />)}</svg>;
}
