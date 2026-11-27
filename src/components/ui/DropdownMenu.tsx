'use client';

import * as React from 'react';
import Divider from '@mui/material/Divider';
import ListItemIcon from '@mui/material/ListItemIcon';
import Menu from '@mui/material/Menu';
import MenuItem from '@mui/material/MenuItem';

export interface DropdownMenuItem {
  id: string;
  label: string;
  description?: string;
  icon?: React.ReactNode;
  tone?: 'default' | 'danger';
  disabled?: boolean;
  dividerBefore?: boolean;
  onSelect: () => void;
}

export interface DropdownMenuProps {
  trigger: (props: {
    open: boolean;
    onClick: (event: React.MouseEvent<HTMLElement>) => void;
  }) => React.ReactNode;
  items: DropdownMenuItem[];
  header?: React.ReactNode;
  align?: 'left' | 'right';
  minWidth?: number;
}

/**
 * Reusable accessible dropdown menu powered by MUI Menu and BIS theme tokens.
 */
export function DropdownMenu({
  trigger,
  items,
  header,
  align = 'right',
  minWidth = 220,
}: DropdownMenuProps) {
  const [anchorEl, setAnchorEl] = React.useState<null | HTMLElement>(null);
  const open = Boolean(anchorEl);

  const handleOpen = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  return (
    <>
      {trigger({ open, onClick: handleOpen })}
      <Menu
        anchorEl={anchorEl}
        open={open}
        onClose={handleClose}
        anchorOrigin={{
          vertical: 'bottom',
          horizontal: align === 'right' ? 'right' : 'left',
        }}
        transformOrigin={{
          vertical: 'top',
          horizontal: align === 'right' ? 'right' : 'left',
        }}
        slotProps={{
          paper: {
            sx: {
              minWidth,
              p: 0.5,
            },
          },
        }}
      >
        {header && (
          <div>
            {header}
            <Divider sx={{ my: 0.5 }} />
          </div>
        )}
        {items.map((item) => (
          <React.Fragment key={item.id}>
            {item.dividerBefore && <Divider sx={{ my: 0.5 }} />}
            <MenuItem
              disabled={item.disabled}
              onClick={() => {
                handleClose();
                item.onSelect();
              }}
              sx={{
                borderRadius: 1.5,
                py: 1,
                px: 1.5,
                fontSize: '0.84rem',
                color:
                  item.tone === 'danger'
                    ? 'var(--bis-danger)'
                    : 'var(--bis-text-primary)',
                '&:hover': {
                  backgroundColor:
                    item.tone === 'danger'
                      ? 'var(--bis-danger-soft)'
                      : 'var(--bis-surface-subtle)',
                },
              }}
            >
              {item.icon && (
                <ListItemIcon
                  sx={{
                    minWidth: 28,
                    color:
                      item.tone === 'danger'
                        ? 'var(--bis-danger)'
                        : 'var(--bis-text-secondary)',
                  }}
                >
                  {item.icon}
                </ListItemIcon>
              )}
              <div className="min-w-0">
                <div className="font-medium leading-tight">{item.label}</div>
                {item.description && (
                  <div className="mt-0.5 text-[11px] text-bis-muted">
                    {item.description}
                  </div>
                )}
              </div>
            </MenuItem>
          </React.Fragment>
        ))}
      </Menu>
    </>
  );
}
