"use client";

import { RoleEnum } from "@/services/api/types/role";
import withPageRequiredAuth from "@/services/auth/with-page-required-auth";
import { useTranslation } from "@/services/i18n/client";
import Container from "@mui/material/Container";
import Grid from "@mui/material/Grid";
import Typography from "@mui/material/Typography";
import {
  PropsWithChildren,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { useGetUsersQuery, usersQueryKeys } from "./queries/queries";
import { TableVirtuoso } from "react-virtuoso";
import TableCell from "@mui/material/TableCell";
import TableRow from "@mui/material/TableRow";
import Avatar from "@mui/material/Avatar";
import LinearProgress from "@mui/material/LinearProgress";
import { styled } from "@mui/material/styles";
import TableComponents from "@/components/table/table-components";
import ButtonGroup from "@mui/material/ButtonGroup";
import Button from "@mui/material/Button";
import ArrowDropDownIcon from "@mui/icons-material/ArrowDropDown";
import ClickAwayListener from "@mui/material/ClickAwayListener";
import Grow from "@mui/material/Grow";
import Paper from "@mui/material/Paper";
import Popper from "@mui/material/Popper";
import MenuItem from "@mui/material/MenuItem";
import MenuList from "@mui/material/MenuList";
import { User } from "@/services/api/types/user";
import Link from "@/components/link";
import useAuth from "@/services/auth/use-auth";
import useConfirmDialog from "@/components/confirm-dialog/use-confirm-dialog";
import { useDeleteUsersService } from "@/services/api/services/users";
import removeDuplicatesFromArrayObjects from "@/services/helpers/remove-duplicates-from-array-of-objects";
import { InfiniteData, useQueryClient } from "@tanstack/react-query";
import UserFilter from "./user-filter";
import { useRouter, useSearchParams } from "next/navigation";
import TableSortLabel from "@mui/material/TableSortLabel";
import { UserFilterType, UserSortType } from "./user-filter-types";
import { SortEnum } from "@/services/api/types/sort-type";
import TextField from "@mui/material/TextField";
import SearchIcon from "@mui/icons-material/Search";
import InputAdornment from "@mui/material/InputAdornment";

type UsersKeys = keyof User;

const TableCellLoadingContainer = styled(TableCell)(() => ({
  padding: 0,
}));

function TableSortCellWrapper(
  props: PropsWithChildren<{
    width?: number;
    orderBy: UsersKeys;
    order: SortEnum;
    column: UsersKeys;
    handleRequestSort: (
      event: React.MouseEvent<unknown>,
      property: UsersKeys
    ) => void;
  }>
) {
  return (
    <TableCell
      style={{ width: props.width }}
      sortDirection={props.orderBy === props.column ? props.order : false}
    >
      <TableSortLabel
        active={props.orderBy === props.column}
        direction={props.orderBy === props.column ? props.order : SortEnum.ASC}
        onClick={(event) => props.handleRequestSort(event, props.column)}
      >
        {props.children}
      </TableSortLabel>
    </TableCell>
  );
}

function Actions({ user }: { user: User }) {
  const [open, setOpen] = useState(false);
  const { user: authUser } = useAuth();
  const { confirmDialog } = useConfirmDialog();
  const fetchUserDelete = useDeleteUsersService();
  const queryClient = useQueryClient();
  const anchorRef = useRef<HTMLDivElement>(null);
  const canDelete = user.id !== authUser?.id;
  const { t: tUsers } = useTranslation("admin-panel-users");
  const { t: tCommon } = useTranslation("common-ui");

  const handleToggle = () => {
    setOpen((prevOpen) => !prevOpen);
  };

  const handleClose = (event: Event) => {
    if (
      anchorRef.current &&
      anchorRef.current.contains(event.target as HTMLElement)
    ) {
      return;
    }

    setOpen(false);
  };

  const handleDelete = async () => {
    const isConfirmed = await confirmDialog({
      title: tUsers("admin-panel-users:confirm.delete.title"),
      message: tUsers("admin-panel-users:confirm.delete.message"),
    });

    if (isConfirmed) {
      setOpen(false);

      const searchParams = new URLSearchParams(window.location.search);
      const searchParamsFilter = searchParams.get("filter");
      const searchParamsSort = searchParams.get("sort");

      let filter: UserFilterType | undefined = undefined;
      let sort: UserSortType | undefined = {
        order: SortEnum.DESC,
        orderBy: "id",
      };

      if (searchParamsFilter) {
        filter = JSON.parse(searchParamsFilter);
      }

      if (searchParamsSort) {
        sort = JSON.parse(searchParamsSort);
      }

      const previousData = queryClient.getQueryData<
        InfiniteData<{ nextPage: number; data: User[] }>
      >(usersQueryKeys.list().sub.by({ sort, filter }).key);

      await queryClient.cancelQueries({ queryKey: usersQueryKeys.list().key });

      const newData = {
        ...previousData,
        pages: previousData?.pages.map((page) => ({
          ...page,
          data: page?.data.filter((item) => item.id !== user.id),
        })),
      };

      queryClient.setQueryData(
        usersQueryKeys.list().sub.by({ sort, filter }).key,
        newData
      );

      await fetchUserDelete({
        id: user.id,
      });
    }
  };

  const mainButton = (
    <Button
      size="small"
      variant="contained"
      LinkComponent={Link}
      href={`/admin-panel/users/edit/${user.id}`}
    >
      {tUsers("admin-panel-users:actions.edit")}
    </Button>
  );

  return (
    <>
      {[!canDelete].every(Boolean) ? (
        mainButton
      ) : (
        <ButtonGroup
          variant="contained"
          ref={anchorRef}
          aria-label={tCommon("common-ui:ariaLabels.splitButton")}
          size="small"
        >
          {mainButton}

          <Button
            size="small"
            aria-controls={open ? "split-button-menu" : undefined}
            aria-expanded={open ? "true" : undefined}
            aria-label={tCommon("common-ui:ariaLabels.selectMergeStrategy")}
            aria-haspopup="menu"
            onClick={handleToggle}
          >
            <ArrowDropDownIcon />
          </Button>
        </ButtonGroup>
      )}
      <Popper
        sx={{
          zIndex: 1,
        }}
        open={open}
        anchorEl={anchorRef.current}
        role={undefined}
        transition
        disablePortal
      >
        {({ TransitionProps, placement }) => (
          <Grow
            {...TransitionProps}
            style={{
              transformOrigin:
                placement === "bottom" ? "center top" : "center bottom",
            }}
          >
            <Paper>
              <ClickAwayListener onClickAway={handleClose}>
                <MenuList id="split-button-menu" autoFocusItem>
                  {canDelete && (
                    <MenuItem
                      sx={{
                        bgcolor: "error.main",
                        color: `var(--mui-palette-common-white)`,
                        "&:hover": {
                          bgcolor: "error.light",
                        },
                      }}
                      onClick={handleDelete}
                    >
                      {tUsers("admin-panel-users:actions.delete")}
                    </MenuItem>
                  )}
                </MenuList>
              </ClickAwayListener>
            </Paper>
          </Grow>
        )}
      </Popper>
    </>
  );
}

function Users() {
  const { t: tUsers } = useTranslation("admin-panel-users");
  const { t: tRoles } = useTranslation("admin-panel-roles");
  const { t: tCommon } = useTranslation("common-ui");
  const searchParams = useSearchParams();
  const router = useRouter();
  const [searchValue, setSearchValue] = useState(() => {
    const searchParamsFilter = searchParams.get("filter");
    if (searchParamsFilter) {
      const parsed = JSON.parse(searchParamsFilter) as UserFilterType;
      return parsed.search || "";
    }
    return "";
  });

  const { order, orderBy } = useMemo(() => {
    const searchParamsSort = searchParams.get("sort");
    if (searchParamsSort) {
      return JSON.parse(searchParamsSort);
    }
    return { order: SortEnum.DESC, orderBy: "id" };
  }, [searchParams]);

  const handleRequestSort = (
    event: React.MouseEvent<unknown>,
    property: UsersKeys
  ) => {
    const isAsc = orderBy === property && order === SortEnum.ASC;
    const searchParams = new URLSearchParams(window.location.search);
    const newOrder = isAsc ? SortEnum.DESC : SortEnum.ASC;
    const newOrderBy = property;
    searchParams.set(
      "sort",
      JSON.stringify({ order: newOrder, orderBy: newOrderBy })
    );
    router.replace(window.location.pathname + "?" + searchParams.toString());
  };

  const handleSearchChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const value = event.target.value;
    setSearchValue(value);
  };

  // Debounced URL update for search
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      const searchParams = new URLSearchParams(window.location.search);
      const currentFilter = searchParams.get("filter");
      let filter: UserFilterType = {};

      if (currentFilter) {
        filter = JSON.parse(currentFilter);
      }

      if (searchValue.trim()) {
        filter.search = searchValue.trim();
      } else {
        delete filter.search;
      }

      if (Object.keys(filter).length > 0) {
        searchParams.set("filter", JSON.stringify(filter));
      } else {
        searchParams.delete("filter");
      }

      router.replace(window.location.pathname + "?" + searchParams.toString());
    }, 2500);

    return () => clearTimeout(timeoutId);
  }, [searchValue, router]);

  const filter = useMemo(() => {
    const searchParamsFilter = searchParams.get("filter");
    if (searchParamsFilter) {
      const parsed = JSON.parse(searchParamsFilter) as UserFilterType;
      return parsed;
    }

    return undefined;
  }, [searchParams]);

  const { data, hasNextPage, isFetchingNextPage, fetchNextPage } =
    useGetUsersQuery({ filter, sort: { order, orderBy } });

  const handleScroll = useCallback(() => {
    if (!hasNextPage || isFetchingNextPage) return;
    fetchNextPage();
  }, [hasNextPage, isFetchingNextPage, fetchNextPage]);

  const result = useMemo(() => {
    const result =
      (data?.pages.flatMap((page) => page?.data) as User[]) ?? ([] as User[]);

    return removeDuplicatesFromArrayObjects(result, "id");
  }, [data]);

  return (
    <Container maxWidth="xl">
      <Grid container spacing={3} pt={3}>
        <Grid container spacing={3} size={{ xs: 12 }}>
          <Grid size="grow">
            <Typography variant="h3">
              {tUsers("admin-panel-users:title")}
            </Typography>
          </Grid>
          <Grid container size="auto" wrap="nowrap" spacing={2}>
            <Grid size="auto">
              <TextField
                value={searchValue}
                onChange={handleSearchChange}
                placeholder={tUsers(
                  "admin-panel-users:filter.inputs.search.label"
                )}
                variant="outlined"
                size="small"
                sx={{ width: 250 }}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <SearchIcon />
                    </InputAdornment>
                  ),
                }}
              />
            </Grid>
            <Grid size="auto">
              <UserFilter />
            </Grid>
            <Grid size="auto">
              <Button
                variant="contained"
                LinkComponent={Link}
                href="/admin-panel/users/create"
                color="success"
              >
                {tUsers("admin-panel-users:actions.create")}
              </Button>
            </Grid>
          </Grid>
        </Grid>

        <Grid size={{ xs: 12 }} mb={2}>
          <TableVirtuoso
            style={{ height: 500 }}
            data={result}
            components={TableComponents}
            endReached={handleScroll}
            overscan={20}
            useWindowScroll
            increaseViewportBy={400}
            fixedHeaderContent={() => (
              <>
                <TableRow>
                  <TableCell style={{ width: 50 }}></TableCell>
                  <TableSortCellWrapper
                    width={100}
                    orderBy={orderBy}
                    order={order}
                    column="id"
                    handleRequestSort={handleRequestSort}
                  >
                    {tUsers("admin-panel-users:table.column1")}
                  </TableSortCellWrapper>
                  <TableSortCellWrapper
                    width={200}
                    orderBy={orderBy}
                    order={order}
                    column="firstName"
                    handleRequestSort={handleRequestSort}
                  >
                    {tUsers("admin-panel-users:table.column2")}
                  </TableSortCellWrapper>
                  <TableSortCellWrapper
                    orderBy={orderBy}
                    order={order}
                    column="email"
                    handleRequestSort={handleRequestSort}
                  >
                    {tUsers("admin-panel-users:table.column3")}
                  </TableSortCellWrapper>

                  <TableSortCellWrapper
                    width={160}
                    orderBy={orderBy}
                    order={order}
                    column="phoneNumber"
                    handleRequestSort={handleRequestSort}
                  >
                    {tUsers("admin-panel-users:table.column4")}
                  </TableSortCellWrapper>

                  <TableSortCellWrapper
                    width={80}
                    orderBy={orderBy}
                    order={order}
                    column="role"
                    handleRequestSort={handleRequestSort}
                  >
                    {tUsers("admin-panel-users:table.column5")}
                  </TableSortCellWrapper>
                  <TableCell style={{ width: 130 }}></TableCell>
                </TableRow>
                {isFetchingNextPage && (
                  <TableRow>
                    <TableCellLoadingContainer colSpan={7}>
                      <LinearProgress />
                    </TableCellLoadingContainer>
                  </TableRow>
                )}
              </>
            )}
            itemContent={(index, user) => (
              <>
                <TableCell style={{ width: 50 }}>
                  <Avatar
                    alt={user?.firstName + " " + user?.lastName}
                    src={user?.photo?.path}
                  />
                </TableCell>
                <TableCell style={{ width: 100 }}>{user?.id}</TableCell>
                <TableCell style={{ width: 200 }}>
                  {user?.firstName} {user?.lastName}
                </TableCell>
                <TableCell>{user?.email}</TableCell>
                <TableCell style={{ width: 160 }}>
                  {user?.phoneNumber ||
                    tCommon("common-ui:status.notAvailable")}
                  {user?.phoneVerified &&
                    ` ${tCommon("common-ui:status.verified")}`}
                </TableCell>
                <TableCell style={{ width: 80 }}>
                  {tRoles(`role.${user?.role?.id}`)}
                </TableCell>
                <TableCell style={{ width: 130 }}>
                  {!!user && <Actions user={user} />}
                </TableCell>
              </>
            )}
          />
        </Grid>
      </Grid>
    </Container>
  );
}

export default withPageRequiredAuth(Users, { roles: [RoleEnum.ADMIN] });
