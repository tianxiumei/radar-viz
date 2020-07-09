import { DefaultSplits, IColors } from "./constants"

export function getItemColor(
    value: number,
    colorSplitter: IColors
  ) {
    const splitters =
      !colorSplitter||!colorSplitter.splitters
        ? DefaultSplits
        : colorSplitter.splitters
    for (let i = 0; i < splitters.length; i++) {
      if (value < splitters[i].number) {
        return splitters[i].color
      }
    }
    return splitters[splitters.length - 1].color
  }