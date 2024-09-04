import { ExpandLess, ExpandMore } from '@mui/icons-material';
import {
  Collapse,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Typography
} from '@mui/material';
import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';

export interface NavItemProps {
  href?: string;
  icon: any;
  items?: NavItemProps[];
  permissions?: string[];
  text: string;
  tag?: any;
  level?: number;
  onClick?: () => void;
}

function withIconHoc(IconComponent: any) {
  // eslint-disable-next-line react/display-name
  return function (props: any) {
    return <IconComponent {...props} />;
  };
}

export default function NavItem(props: NavItemProps) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [active, setActive] = useState(false);
  let { level = 1 } = props;

  const IconHOC = withIconHoc(props.icon);

  const handleItemClick = (item: NavItemProps) => {
    if (!item.items && item.href) {
      router.replace(item.href);
    }

    if (item.items) {
      setOpen(!open);
    }

    if (item.onClick) {
      item.onClick();
    }
  };

  const amIOrMyChildActive = (item: NavItemProps) => {
    if (item.href && router.route.startsWith(item.href)) {
      return true;
    }

    if (item.items) {
      for (const x of item.items) {
        if (amIOrMyChildActive(x)) {
          return true;
        }
      }
    }

    return false;
  };

  useEffect(() => {
    if (amIOrMyChildActive(props)) {
      setOpen(true);
      setActive(true);
    } else {
      setActive(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [router.route]);

  return (
    <>
      <ListItemButton
        onClick={() => handleItemClick(props)}
        sx={{ pl: level * 2 }}
        selected={active && !props.href}
      >
        <ListItemIcon>
          <IconHOC color={active ? 'primary' : undefined} />
        </ListItemIcon>
        <ListItemText
          primary={
            <Typography
              color={active ? 'primary' : undefined}
              fontWeight={active ? 'medium' : undefined}
            >
              {props.text}
            </Typography>
          }
        />

        {props.items && (open ? <ExpandLess /> : <ExpandMore />)}
      </ListItemButton>

      {props.items && (
        <Collapse in={open} timeout="auto" unmountOnExit>
          <List component="div" disablePadding>
            {props.items.map((x, i) => (
              <NavItem {...x} level={level + 1} key={i} />
            ))}
          </List>
        </Collapse>
      )}
    </>
  );
}
