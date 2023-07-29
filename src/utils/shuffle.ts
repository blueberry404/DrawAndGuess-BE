export const shuffled = (arr: string[]) => arr.reduce(([a, b]) =>
    (b.push(...a.splice(Math.random() * a.length | 0, 1)), [a, b]), [[...arr], []])[1]
