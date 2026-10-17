import type { ReactNode } from "react";
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

export interface DataTableColumn<T> {
  id: string;
  header: ReactNode;
  cell: (row: T) => ReactNode;
  /** Plain-text label shown next to the value in the mobile card. Defaults to the header when it is a string. */
  mobileLabel?: string;
  /** Hide this column from the mobile card. Use for redundant or decorative columns. */
  mobileHidden?: boolean;
  /** Show this column as the card heading on mobile. Defaults to the first labelled column. */
  mobilePrimary?: boolean;
  headClassName?: string;
  cellClassName?: string;
}

function columnLabel<T>(column: DataTableColumn<T>): string | null {
  if (column.mobileLabel) {
    return column.mobileLabel;
  }
  if (typeof column.header === "string") {
    return column.header;
  }
  return null;
}

export function DataTable<T>({
  columns,
  data,
  getRowKey,
  empty,
  caption,
  className,
  mobileCard,
}: {
  columns: DataTableColumn<T>[];
  data: T[];
  getRowKey: (row: T, index: number) => string;
  empty?: ReactNode;
  caption?: string;
  className?: string;
  /** Render a fully custom mobile card instead of the default label and value layout. */
  mobileCard?: (row: T) => ReactNode;
}) {
  if (data.length === 0 && empty) {
    return <>{empty}</>;
  }

  const mobileColumns = columns.filter((column) => !column.mobileHidden);
  const labeledColumns = mobileColumns.filter(
    (column) => columnLabel(column) !== null,
  );
  const actionColumns = mobileColumns.filter(
    (column) => columnLabel(column) === null,
  );
  const primaryColumn =
    mobileColumns.find((column) => column.mobilePrimary) ??
    labeledColumns.at(0);
  const detailColumns = labeledColumns.filter(
    (column) => column !== primaryColumn,
  );

  return (
    <div className={className}>
      <ul className="flex flex-col gap-3 md:hidden">
        {data.map((row, index) => (
          <li
            key={getRowKey(row, index)}
            className="rounded-xl border border-border bg-card p-4"
          >
            {mobileCard ? (
              mobileCard(row)
            ) : (
              <div className="flex flex-col gap-3">
                {primaryColumn ? (
                  <div className="text-sm font-medium">
                    {primaryColumn.cell(row)}
                  </div>
                ) : null}
                {detailColumns.length ? (
                  <dl className="flex flex-col gap-2.5">
                    {detailColumns.map((column) => (
                      <div
                        key={column.id}
                        className="flex items-start justify-between gap-4"
                      >
                        <dt className="text-xs font-medium text-muted-foreground">
                          {columnLabel(column)}
                        </dt>
                        <dd className="min-w-0 text-right text-sm">
                          {column.cell(row)}
                        </dd>
                      </div>
                    ))}
                  </dl>
                ) : null}
                {actionColumns.length ? (
                  <div className="flex flex-wrap items-center justify-end gap-2 border-t border-border pt-3">
                    {actionColumns.map((column) => (
                      <div key={column.id}>{column.cell(row)}</div>
                    ))}
                  </div>
                ) : null}
              </div>
            )}
          </li>
        ))}
      </ul>

      <div className="hidden overflow-hidden rounded-xl border border-border bg-card md:block">
        <Table>
          {caption ? <TableCaption>{caption}</TableCaption> : null}
          <TableHeader>
            <TableRow className="bg-muted/40 hover:bg-muted/40">
              {columns.map((column) => (
                <TableHead key={column.id} className={column.headClassName}>
                  {column.header}
                </TableHead>
              ))}
            </TableRow>
          </TableHeader>
          <TableBody>
            {data.map((row, index) => (
              <TableRow key={getRowKey(row, index)}>
                {columns.map((column) => (
                  <TableCell key={column.id} className={column.cellClassName}>
                    {column.cell(row)}
                  </TableCell>
                ))}
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
