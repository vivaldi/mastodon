import { useCallback, useMemo } from 'react';
import type { FC } from 'react';

import { defineMessages, useIntl } from 'react-intl';

import classNames from 'classnames';

import {
  ArrowsClockwiseIcon,
  CameraIcon,
  PencilIcon,
  PlusIcon,
  TrashIcon,
} from '@phosphor-icons/react';

import type { ModalType } from '@/mastodon/actions/modal';
import { openModal } from '@/mastodon/actions/modal';
import { IconButton } from '@/mastodon/components/button';
import {
  LegacyDropdownMenuItems,
  Menu,
  MenuList,
  MenuTrigger,
} from '@/mastodon/components/menu';
import type { MenuItem } from '@/mastodon/models/dropdown_menu';
import type { ImageLocation } from '@/mastodon/reducers/slices/profile_edit';
import { selectImageInfo } from '@/mastodon/reducers/slices/profile_edit';
import { useAppDispatch, useAppSelector } from '@/mastodon/store';

import classes from '../styles.module.scss';

const messages = defineMessages({
  add: {
    id: 'account_edit.image_edit.add_button',
    defaultMessage: 'Add image',
  },
  replace: {
    id: 'account_edit.image_edit.replace_button',
    defaultMessage: 'Replace image',
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
  remove: {
    id: 'account_edit.image_edit.remove_button',
    defaultMessage: 'Remove image',
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

  let items;
  if (location === 'header') {
    items = useMemo(
      () =>
        [
          {
            text: intl.formatMessage(messages.replace),
            action: () => {
              handleModal('ACCOUNT_EDIT_IMAGE_UPLOAD');
            },
            icon: ArrowsClockwiseIcon,
          },
          {
            text: intl.formatMessage(hasAlt ? messages.altEdit : messages.altAdd),
            action: () => {
              handleModal('ACCOUNT_EDIT_IMAGE_ALT');
            },
            icon: hasAlt ? PencilIcon : PlusIcon,
          },
          null,
          {
            text: intl.formatMessage(messages.remove),
            action: () => {
              handleModal('ACCOUNT_EDIT_IMAGE_DELETE');
            },
            icon: TrashIcon,
            dangerous: true,
          },
        ] satisfies MenuItem[],
      [handleModal, hasAlt, intl],
    );
  } else {
    items = useMemo(
      () =>
        [
          {
            text: intl.formatMessage(hasAlt ? messages.altEdit : messages.altAdd),
            action: () => {
              handleModal('ACCOUNT_EDIT_IMAGE_ALT');
            },
            icon: hasAlt ? PencilIcon : PlusIcon,
          },
        ] satisfies MenuItem[],
      [handleModal, hasAlt, intl],
    );
  }

  const handleAddImage = useCallback(() => {
    handleModal('ACCOUNT_EDIT_IMAGE_UPLOAD');
  }, [handleModal]);

  const iconClassName = classNames(classes.imageButton, className);

  if (!src) {
    if (location !== 'header') {
      return (
        <IconButton
          icon={PencilIcon}
          className={iconClassName}
          onClick={handleAddImage}
          size='sm'
          variant='solid'
        >
          {intl.formatMessage(messages.altAdd)}
        </IconButton>
      );
    }
    return (
      <IconButton
        icon={CameraIcon}
        className={iconClassName}
        onClick={handleAddImage}
        size='sm'
        variant='solid'
      >
        {intl.formatMessage(messages.add)}
      </IconButton>
    );
  }

  if (location !== 'header') {
    return (
      <Menu>
        <MenuTrigger
          as={IconButton}
          icon={PencilIcon}
          size='sm'
          variant='solid'
          className={iconClassName}
        >
          {intl.formatMessage(hasAlt ? messages.altEdit : messages.altAdd)}
        </MenuTrigger>
        <MenuList
          offset={6}
          placement={location === 'header' ? 'bottom-end' : 'bottom-start'}
        >
          <LegacyDropdownMenuItems items={items} />
        </MenuList>
      </Menu>
    );
  }
  return (
    <Menu>
      <MenuTrigger
        as={IconButton}
        icon={CameraIcon}
        size='sm'
        variant='solid'
        className={iconClassName}
      >
        {intl.formatMessage(messages.replace)}
      </MenuTrigger>
      <MenuList
        offset={6}
        placement={location === 'header' ? 'bottom-end' : 'bottom-start'}
      >
        <LegacyDropdownMenuItems items={items} />
      </MenuList>
    </Menu>
  );
};
