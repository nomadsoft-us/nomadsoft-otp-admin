import { Ref } from "react";
import Table, { TableProps } from "@mui/material/Table";
import TableBody, { TableBodyProps } from "@mui/material/TableBody";
import TableContainer from "@mui/material/TableContainer";
import TableHead, { TableHeadProps } from "@mui/material/TableHead";
import TableFooter from "@mui/material/TableFooter";
import TableRow, { TableRowProps } from "@mui/material/TableRow";
import { styled } from "@mui/material/styles";
import { useColorScheme } from "@mui/material/styles";
import {
  ScrollerProps,
  TableComponents as TableComponentsType,
} from "react-virtuoso";

const GlassmorphismTableContainer = styled(TableContainer)<{
  isLightMode?: boolean;
}>(({ theme, isLightMode }) => ({
  backgroundColor: isLightMode
    ? "rgba(255, 255, 255, 0.15)"
    : "rgba(107, 114, 128, 0.12)",
  backgroundClip: "padding-box",
  backdropFilter: "blur(12px) saturate(100%) contrast(125%)",
  backgroundImage: `url('data:image/svg+xml;base64,CiAgICAgIDxzdmcgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIiB2ZXJzaW9uPSIxLjEiIHhtbG5zOnhsaW5rPSJodHRwOi8vd3d3LnczLm9yZy8xOTk5L3hsaW5rIiB4bWxuczpzdmdqcz0iaHR0cDovL3N2Z2pzLmRldi9zdmdqcyIgdmlld0JveD0iMCAwIDcwMCA3MDAiIHdpZHRoPSI3MDAiIGhlaWdodD0iNzAwIiBvcGFjaXR5PSIwLjI3Ij4KICAgICAgICA8ZGVmcz4KICAgICAgICAgIDxmaWx0ZXIgaWQ9Im5ubm9pc2UtZmlsdGVyIiB4PSItMjAlIiB5PSItMjAlIiB3aWR0aD0iMTQwJSIgaGVpZ2h0PSIxNDAlIiBmaWx0ZXJVbml0cz0ib2JqZWN0Qm91bmRpbmdCb3giIHByaW1pdGl2ZVVuaXRzPSJ1c2VyU3BhY2VPblVzZSIgY29sb3ItaW50ZXJwb2xhdGlvbi1maWx0ZXJzPSJsaW5lYXJSR0IiPgogICAgICAgICAgICA8ZmVUdXJidWxlbmNlIHR5cGU9ImZyYWN0YWxOb2lzZSIgYmFzZUZyZXF1ZW5jeT0iMC4wMTgiIG51bU9jdGF2ZXM9IjQiIHNlZWQ9IjE1IiBzdGl0Y2hUaWxlcz0ic3RpdGNoIiB4PSIwJSIgeT0iMCUiIHdpZHRoPSIxMDAlIiBoZWlnaHQ9IjEwMCUiIHJlc3VsdD0idHVyYnVsZW5jZSI+PC9mZVR1cmJ1bGVuY2U+CiAgICAgICAgICAgIDxmZVNwZWN1bGFyTGlnaHRpbmcgc3VyZmFjZVNjYWxlPSIxMiIgc3BlY3VsYXJDb25zdGFudD0iMC43IiBzcGVjdWxhckV4cG9uZW50PSIyMCIgbGlnaHRpbmctY29sb3I9IiM3OTU3QTgiIHg9IjAlIiB5PSIwJSIgd2lkdGg9IjEwMCUiIGhlaWdodD0iMTAwJSIgaW49InR1cmJ1bGVuY2UiIHJlc3VsdD0ic3BlY3VsYXJMaWdodGluZyI+CiAgICAgICAgICAgICAgPGZlRGlzdGFudExpZ2h0IGF6aW11dGg9IjMiIGVsZXZhdGlvbj0iMTAwIj48L2ZlRGlzdGFudExpZ2h0PgogICAgICAgICAgICA8L2ZlU3BlY3VsYXJMaWdodGluZz4KICAgICAgICAgICAgPGZlQ29sb3JNYXRyaXggdHlwZT0ic2F0dXJhdGUiIHZhbHVlcz0iMCIgeD0iMCUiIHk9IjAlIiB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBpbj0ic3BlY3VsYXJMaWdodGluZyIgcmVzdWx0PSJjb2xvcm1hdHJpeCI+PC9mZUNvbG9yTWF0cml4PgogICAgICAgICAgPC9maWx0ZXI+CiAgICAgICAgPC9kZWZzPgogICAgICAgIDxyZWN0IHdpZHRoPSI3MDAiIGhlaWdodD0iNzAwIiBmaWxsPSJ0cmFuc3BhcmVudCI+PC9yZWN0PgogICAgICAgIDxyZWN0IHdpZHRoPSI3MDAiIGhlaWdodD0iNzAwIiBmaWxsPSIjNzk1N2E4IiBmaWx0ZXI9InVybCgjbm5ub2lzZS1maWx0ZXIpIj48L3JlY3Q+CiAgICAgIDwvc3ZnPgogICAg')`,
  backgroundBlendMode: "overlay",
  position: "relative",
  overflow: "hidden",
  borderRadius: theme.shape.borderRadius,
  border: isLightMode
    ? `1px solid rgba(0, 0, 0, 0.1)`
    : `1px solid rgba(255, 255, 255, 0.08)`,
}));

const StyledHeaderRow = styled(TableRow)<{ isLightMode?: boolean }>(
  ({ isLightMode }) => ({
    backgroundColor: isLightMode
      ? "rgba(255, 255, 255, 0.25)"
      : "rgba(107, 114, 128, 0.2)",
    backdropFilter: "blur(8px) saturate(110%) contrast(120%)",
    borderBottom: isLightMode
      ? `1px solid rgba(0, 0, 0, 0.1)`
      : `1px solid rgba(255, 255, 255, 0.08)`,
    "& .MuiTableCell-root": {
      color: isLightMode ? "black" : "white",
      fontWeight: 600,
      borderBottom: "none",
      background: "transparent",
    },
    "& .MuiTableSortLabel-root": {
      color: isLightMode ? "black" : "white",
      "&:hover": {
        color: isLightMode ? "rgba(0, 0, 0, 0.8)" : "rgba(255, 255, 255, 0.8)",
      },
      "&.Mui-active": {
        color: isLightMode ? "black" : "white",
        "& .MuiTableSortLabel-icon": {
          color: `${isLightMode ? "black" : "white"} !important`,
        },
      },
    },
  })
);

const StyledDataRow = styled(TableRow)<{ isLightMode?: boolean }>(
  ({ isLightMode }) => ({
    backgroundColor: isLightMode
      ? "rgba(255, 255, 255, 0.08)"
      : "rgba(107, 114, 128, 0.06)",
    backdropFilter: "blur(6px) saturate(100%) contrast(110%)",
    borderBottom: isLightMode
      ? `1px solid rgba(0, 0, 0, 0.05)`
      : `1px solid rgba(255, 255, 255, 0.04)`,
    transition: "all 0.2s cubic-bezier(0.4, 0, 0.2, 1)",
    "&:hover": {
      backgroundColor: isLightMode
        ? "rgba(255, 255, 255, 0.15)"
        : "rgba(107, 114, 128, 0.12)",
      backdropFilter: "blur(8px) saturate(105%) contrast(115%)",
      transform: "translateY(-1px)",
      boxShadow: isLightMode
        ? "0 4px 12px rgba(0, 0, 0, 0.08)"
        : "0 4px 12px rgba(0, 0, 0, 0.2)",
    },
    "&:last-child": {
      borderBottom: "none",
    },
    "& .MuiTableCell-root": {
      color: isLightMode ? "rgba(0, 0, 0, 0.87)" : "rgba(255, 255, 255, 0.87)",
      borderBottom: "none",
      background: "transparent",
    },
  })
);

const StyledLoadingRow = styled(TableRow)(() => ({
  backgroundColor: "rgba(107, 114, 128, 0.2)",
  backdropFilter: "blur(6px) saturate(100%) contrast(110%)",
  "& .MuiTableCell-root": {
    padding: 0,
    borderBottom: "none",
    background: "transparent",
  },
}));

function HeaderRowWrapper({ children, ...props }: TableRowProps) {
  const { colorScheme } = useColorScheme();
  const isLightMode = colorScheme === "light";
  return (
    <StyledHeaderRow isLightMode={isLightMode} {...props}>
      {children}
    </StyledHeaderRow>
  );
}

function DataRowWrapper({ children, ...props }: TableRowProps) {
  const { colorScheme } = useColorScheme();
  const isLightMode = colorScheme === "light";
  return (
    <StyledDataRow isLightMode={isLightMode} {...props}>
      {children}
    </StyledDataRow>
  );
}

const GlassmorphismTableComponents = {
  Scroller: function Scroller(
    props: ScrollerProps & { ref?: Ref<HTMLDivElement> }
  ) {
    const { colorScheme } = useColorScheme();
    const isLightMode = colorScheme === "light";
    return (
      <GlassmorphismTableContainer
        isLightMode={isLightMode}
        {...props}
        ref={props.ref}
      />
    );
  },
  Table: (props: TableProps) => (
    <Table
      stickyHeader
      {...props}
      style={{
        borderCollapse: "separate",
        backgroundColor: "transparent",
      }}
    />
  ),
  TableHead: function StyledTableHead(props: TableHeadProps) {
    return <TableHead {...props}>{props.children}</TableHead>;
  } as unknown as TableComponentsType["TableHead"],
  TableFoot: TableFooter as unknown as TableComponentsType["TableFoot"],
  TableRow: DataRowWrapper,
  TableBody: function BodyTable(
    props: TableBodyProps & { ref?: Ref<HTMLTableSectionElement> }
  ) {
    return <TableBody {...props} ref={props.ref} />;
  },
};

export default GlassmorphismTableComponents;
export { HeaderRowWrapper, StyledLoadingRow };
