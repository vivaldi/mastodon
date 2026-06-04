import { useCallback, useMemo } from 'react';
import type { FC } from 'react';

import { defineMessages, useIntl } from 'react-intl';

import classNames from 'classnames';

import type { OffsetValue } from 'react-overlays/esm/usePopper';

import type { ModalType } from '@/mastodon/actions/modal';
import { openModal } from '@/mastodon/actions/modal';
import { Dropdown } from '@/mastodon/components/dropdown_menu';
import { IconButton } from '@/mastodon/components/icon_button';
import type { MenuItem } from '@/mastodon/models/dropdown_menu';
import type { ImageLocation } from '@/mastodon/reducers/slices/profile_edit';
import { selectImageInfo } from '@/mastodon/reducers/slices/profile_edit';
import { useAppDispatch, useAppSelector } from '@/mastodon/store';
import AddIcon from '@/material-icons/400-24px/add.svg?react';
import EditIcon from '@/material-icons/400-24px/edit.svg?react';

import classes from '../styles.module.scss';

const messages = defineMessages({
  add: {
    id: 'account_edit.image_edit.add_button',
    defaultMessage: 'Add image',
  },
  altAdd: {
    id: 'account_edit.image_edit.alt_add_button',
    description: 'Alt is short for "alternative".',
    defaultMessage: 'Add alt text',
  },
  altEdit: {
    id: 'account_edit.image_edit.alt_edit_button',
    description: 'Alt is short for "alternative".',
    defaultMessage: 'Edit alt text',
  },
});

export const AccountImageEdit: FC<{
  className?: string;
  location: ImageLocation;
}> = ({ className, location }) => {
  const intl = useIntl();
  const { alt, src } = useAppSelector((state) =>
    selectImageInfo(state, location),
  );
  const hasAlt = !!alt;
  const dispatch = useAppDispatch();

  const handleModal = useCallback(
    (type: ModalType) => {
      dispatch(openModal({ modalType: type, modalProps: { location } }));
    },
    [dispatch, location],
  );

  const items = useMemo(
    () =>
      [
        {
          text: intl.formatMessage(hasAlt ? messages.altEdit : messages.altAdd),
          action: () => {
            handleModal('ACCOUNT_EDIT_IMAGE_ALT');
          },
          icon: hasAlt ? EditIcon : AddIcon,
        },
      ] satisfies MenuItem[],
    [handleModal, hasAlt, intl],
  );

  const iconClassName = classNames(classes.imageButton, className);

  if (!src) {
    return (
      <IconButton
        title={intl.formatMessage(messages.altAdd)}
        icon='edit'
        iconComponent={EditIcon}
        className={iconClassName}
      />
    );
  }

  return (
    <Dropdown
      items={items}
      placement={location === 'header' ? 'bottom-end' : 'bottom-start'}
      offset={popperOffset}
      className={classes.imageMenu}
      icon='edit'
      title={intl.formatMessage(hasAlt ? messages.altEdit : messages.altAdd)}
      iconComponent={EditIcon}
      iconClassName={iconClassName}
    />
  );
};

const popperOffset = [0, 6] as OffsetValue;
