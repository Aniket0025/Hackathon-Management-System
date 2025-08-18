import * as React from "react"

const Table = React.forwardRef<HTMLTableElement, React.HTMLAttributes<HTMLTableElement>>(
  ({ className = "w-full caption-bottom text-sm", ...props }, ref) => (
    <table ref={ref} className={className} {...props} />
  ),
)
Table.displayName = "Table"

const TableHeader = React.forwardRef<HTMLTableSectionElement, React.HTMLAttributes<HTMLTableSectionElement>>(
  ({ className = "[&_tr]:border-b", ...props }, ref) => (
    <thead ref={ref} className={className} {...props} />
  ),
)
TableHeader.displayName = "TableHeader"

const TableBody = React.forwardRef<HTMLTableSectionElement, React.HTMLAttributes<HTMLTableSectionElement>>(
  ({ className, ...props }, ref) => <tbody ref={ref} className={className} {...props} />,
)
TableBody.displayName = "TableBody"

const TableFooter = React.forwardRef<HTMLTableSectionElement, React.HTMLAttributes<HTMLTableSectionElement>>(
  ({ className = "bg-muted/50 font-medium", ...props }, ref) => (
    <tfoot ref={ref} className={className} {...props} />
  ),
)
TableFooter.displayName = "TableFooter"

const TableRow = React.forwardRef<HTMLTableRowElement, React.HTMLAttributes<HTMLTableRowElement>>(
  ({ className = "border-b transition-colors hover:bg-muted/50 data-[state=selected]:bg-muted", ...props }, ref) => (
    <tr ref={ref} className={className} {...props} />
  ),
)
TableRow.displayName = "TableRow"

const TableHead = React.forwardRef<HTMLTableCellElement, React.ThHTMLAttributes<HTMLTableCellElement>>(
  ({ className = "h-12 px-4 text-left align-middle font-medium text-muted-foreground", ...props }, ref) => (
    <th ref={ref} className={className} {...props} />
  ),
)
TableHead.displayName = "TableHead"

const TableCell = React.forwardRef<HTMLTableCellElement, React.TdHTMLAttributes<HTMLTableCellElement>>(
  ({ className = "p-4 align-middle", ...props }, ref) => <td ref={ref} className={className} {...props} />,
)
TableCell.displayName = "TableCell"

const TableCaption = React.forwardRef<HTMLTableCaptionElement, React.HTMLAttributes<HTMLTableCaptionElement>>(
  ({ className = "mt-4 text-sm text-muted-foreground", ...props }, ref) => (
    <caption ref={ref} className={className} {...props} />
  ),
)
TableCaption.displayName = "TableCaption"

export { Table, TableHeader, TableBody, TableFooter, TableHead, TableRow, TableCell, TableCaption }
