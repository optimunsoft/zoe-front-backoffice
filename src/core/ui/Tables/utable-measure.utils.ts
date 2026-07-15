import {
  UTABLE_BODY_ROW_HEIGHT,
  UTABLE_HEADER_ROW_HEIGHT,
} from './utable.types'

const DATA_ROW_SELECTOR = 'tbody > tr:not([role="region"])'

/**
 * Calcula el tope de altura del cuerpo scrollable (thead + N filas).
 * Con menos filas la tabla se encoge; con más, aparece scroll sin crecer.
 */
export function measureUtableMaxBodyHeight(
  container: HTMLElement,
  visibleRows: number,
): number | null {
  if (visibleRows <= 0) return null

  const thead = container.querySelector('thead')
  const dataRows = container.querySelectorAll<HTMLTableRowElement>(DATA_ROW_SELECTOR)

  if (!thead || dataRows.length === 0) return null

  const theadHeight = thead.getBoundingClientRect().height
  const rowsToMeasure = Math.min(visibleRows, dataRows.length)

  let bodyHeight = 0
  for (let index = 0; index < rowsToMeasure; index += 1) {
    bodyHeight += dataRows[index].getBoundingClientRect().height
  }

  if (dataRows.length >= visibleRows) {
    return Math.ceil(theadHeight + bodyHeight)
  }

  const averageRowHeight = bodyHeight / rowsToMeasure
  return Math.ceil(theadHeight + averageRowHeight * visibleRows)
}

export function buildUtableMaxBodyHeightFallback(visibleRows: number): string {
  const rowDividers = Math.max(0, visibleRows - 1)

  return `calc(${UTABLE_HEADER_ROW_HEIGHT} + ${visibleRows} * ${UTABLE_BODY_ROW_HEIGHT} + ${rowDividers} * 1px)`
}
