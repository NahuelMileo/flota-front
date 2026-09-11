"use client"

import {
  ColumnDef,
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  SortingState,
  useReactTable,
} from "@tanstack/react-table"
import { useEffect, useState } from "react"
import { ChevronUp, ChevronDown, ChevronsUpDown, Download, Search } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"

interface DataTableProps<TData, TValue> {
  columns: ColumnDef<TData, TValue>[]
  data: TData[]
  emptyMessage?: string
  searchPlaceholder?: string
  csvFilename?: string
  csvHeaders?: { key: keyof TData; label: string }[]
  /** Orden inicial de la tabla, para listados que tienen un orden natural (una fecha). */
  initialSorting?: SortingState
  /**
   * Para listados que pagina y filtra la API (no el navegador): la tabla muestra las
   * filas tal cual las recibe y delega el cambio de página y la búsqueda.
   */
  serverSide?: {
    page: number
    pageCount: number
    onPageChange: (page: number) => void
    search: string
    onSearchChange: (search: string) => void
  }
}

export function DataTable<TData, TValue>({
  columns,
  data,
  emptyMessage = "Sin resultados.",
  searchPlaceholder = "Buscar...",
  csvFilename = "export",
  csvHeaders,
  serverSide,
  initialSorting,
}: DataTableProps<TData, TValue>) {
  const [sorting, setSorting] = useState<SortingState>(initialSorting ?? [])
  const [searchInput, setSearchInput] = useState("")
  const [globalFilter, setGlobalFilter] = useState("")

  useEffect(() => {
    if (serverSide) return
    const timer = setTimeout(() => setGlobalFilter(searchInput), 300)
    return () => clearTimeout(timer)
  }, [searchInput, serverSide])

  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    ...(serverSide
      ? { manualPagination: true, manualFiltering: true }
      : {
          getFilteredRowModel: getFilteredRowModel(),
          getPaginationRowModel: getPaginationRowModel(),
        }),
    onSortingChange: setSorting,
    onGlobalFilterChange: setGlobalFilter,
    state: { sorting, globalFilter },
    initialState: { pagination: { pageSize: 10 } },
    autoResetPageIndex: false,
  })

  // Con autoResetPageIndex: false, un filtro puede dejar el pageIndex fuera de rango
  const pageCount = serverSide ? serverSide.pageCount : table.getPageCount()
  const pageIndex = table.getState().pagination.pageIndex
  useEffect(() => {
    if (serverSide) return
    if (pageCount > 0 && pageIndex >= pageCount) table.setPageIndex(pageCount - 1)
  }, [pageCount, pageIndex, table, serverSide])

  const currentPage = serverSide ? serverSide.page : pageIndex + 1
  const canPreviousPage = serverSide ? serverSide.page > 1 : table.getCanPreviousPage()
  const canNextPage = serverSide ? serverSide.page < serverSide.pageCount : table.getCanNextPage()

  function goToPreviousPage() {
    if (serverSide) serverSide.onPageChange(Math.max(1, serverSide.page - 1))
    else changePage(() => table.previousPage())
  }

  function goToNextPage() {
    if (serverSide) serverSide.onPageChange(Math.min(serverSide.pageCount, serverSide.page + 1))
    else changePage(() => table.nextPage())
  }

  function changePage(fn: () => void) {
    const y = window.scrollY
    fn()
    requestAnimationFrame(() => window.scrollTo(0, y))
  }

  function exportCSV() {
    const filteredRows = table.getFilteredRowModel().rows
    const headers = csvHeaders ?? []
    const csvLines = [
      headers.map((h) => h.label).join(","),
      ...filteredRows.map((row) =>
        headers
          .map((h) => {
            const val = (row.original as Record<string, unknown>)[h.key as string]
            const str = val == null ? "" : String(val)
            return str.includes(",") ? `"${str}"` : str
          })
          .join(",")
      ),
    ]
    const blob = new Blob([csvLines.join("\n")], { type: "text/csv;charset=utf-8;" })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = `${csvFilename}.csv`
    a.click()
    URL.revokeObjectURL(url)
  }

  return (
    <div className="flex flex-col gap-3">
      <div className="flex items-center gap-2">
        <div className="relative max-w-xs flex-1">
          <Search
            aria-hidden
            className="pointer-events-none absolute top-1/2 left-2.5 size-4 -translate-y-1/2 text-muted-foreground"
          />
          <Input
            placeholder={searchPlaceholder}
            value={serverSide ? serverSide.search : searchInput}
            onChange={(e) =>
              serverSide ? serverSide.onSearchChange(e.target.value) : setSearchInput(e.target.value)
            }
            className="border-transparent bg-muted/50 pl-8 hover:bg-muted focus-visible:bg-transparent"
          />
        </div>
        {csvHeaders && (
          <Button variant="outline" size="sm" onClick={exportCSV} className="ml-auto gap-1.5">
            <Download className="h-4 w-4" />
            Exportar CSV
          </Button>
        )}
      </div>
      <div className="overflow-x-auto">
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header) => {
                  const canSort = header.column.getCanSort()
                  const sorted = header.column.getIsSorted()
                  return (
                    <TableHead
                      key={header.id}
                      onClick={canSort ? header.column.getToggleSortingHandler() : undefined}
                      className={
                        canSort
                          ? "group cursor-pointer select-none transition-colors hover:text-foreground"
                          : ""
                      }
                    >
                      {header.isPlaceholder ? null : (
                        <div className="flex items-center gap-1">
                          {flexRender(header.column.columnDef.header, header.getContext())}
                          {canSort && (
                            sorted === "asc" ? (
                              <ChevronUp className="h-3 w-3 text-muted-foreground" />
                            ) : sorted === "desc" ? (
                              <ChevronDown className="h-3 w-3 text-muted-foreground" />
                            ) : (
                              <ChevronsUpDown className="h-3 w-3 opacity-0 transition-opacity group-hover:opacity-50" />
                            )
                          )}
                        </div>
                      )}
                    </TableHead>
                  )
                })}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {table.getRowModel().rows?.length ? (
              table.getRowModel().rows.map((row) => (
                <TableRow
                  key={row.id}
                  data-state={row.getIsSelected() && "selected"}
                >
                  {row.getVisibleCells().map((cell) => (
                    <TableCell key={cell.id}>
                      {flexRender(cell.column.columnDef.cell, cell.getContext())}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={columns.length} className="h-24 text-center text-muted-foreground">
                  {emptyMessage}
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
      {pageCount > 1 && (
        <div className="flex items-center justify-between text-sm text-muted-foreground">
          <span className="tabular-nums">
            Página {currentPage} de {pageCount}
          </span>
          <div className="flex gap-1">
            <Button variant="ghost" size="sm" onClick={goToPreviousPage} disabled={!canPreviousPage}>
              Anterior
            </Button>
            <Button variant="ghost" size="sm" onClick={goToNextPage} disabled={!canNextPage}>
              Siguiente
            </Button>
          </div>
        </div>
      )}
    </div>
  )
}
