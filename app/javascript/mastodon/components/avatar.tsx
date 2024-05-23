import { useState, useCallback } from 'react';

import classNames from 'classnames';
import { Link } from 'react-router-dom';

import { useHovering } from 'mastodon/hooks/useHovering';
import { autoPlayGif } from 'mastodon/initial_state';
import type { Account, AccountShapeFull } from 'mastodon/models/account';

import { useAccount } from '../hooks/useAccount';

interface Props {
  account?: Pick<
    Account | AccountShapeFull,
    'id' | 'acct' | 'avatar' | 'avatar_static'
  >;
  alt?: string;
  size?: number;
  style?: React.CSSProperties;
  inline?: boolean;
  animate?: boolean;
  withLink?: boolean;
  counter?: number | string;
  counterBorderColor?: string;
  className?: string;
}

export const Avatar: React.FC<Props> = ({
  account,
  alt = '',
  animate = autoPlayGif,
  size = 20,
  inline = false,
  withLink = false,
  style: styleFromParent,
  className,
  counter,
  counterBorderColor,
}) => {
  const { hovering, handleMouseEnter, handleMouseLeave } = useHovering(animate);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const handleBadgeClick = function(e) { window.open('https://login.vivaldi.net/profile/donations', '_blank', 'noopener'); e.preventDefault(); e.stopPropagation(); }

  const style = {
    ...styleFromParent,
    width: `${size}px`,
    height: `${size}px`,
  };

  const src = hovering || animate ? account?.avatar : account?.avatar_static;

  const handleLoad = useCallback(() => {
    setLoading(false);
  }, [setLoading]);

  const handleError = useCallback(() => {
    setError(true);
  }, [setError]);

  let supporterBadge = false, patronBadge = false, advocateBadge = false, roleName = null, badge = '';
  if (account?.roles) {
    account.roles.map((role) => {
      if (role.name == 'Vivaldi Supporter') {
        supporterBadge = true;
        roleName = 'Vivaldi Supporter';
      } else if (role.name == 'Vivaldi Patron') {
        patronBadge = true;
        roleName = 'Vivaldi Patron';
      } else if (role.name == 'Vivaldi Advocate') {
        advocateBadge = true;
        roleName = 'Vivaldi Advocate';
      }
    });
  }

  const avatar = (
    <span
      className={classNames(className, 'account__avatar', {
        'account__avatar--inline': inline,
        'account__avatar--loading': loading,
      })}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      style={style}
    >
      {src && !error && (
        <img src={src} alt={alt} onLoad={handleLoad} onError={handleError} />
      )}

      {counter && (
        <span
          className='account__avatar__counter'
          style={{ borderColor: counterBorderColor }}
        >
          {counter}
        </span>
      )}
    </span>
  );

  if (roleName !== null) {
    badge = (
      <div
        className={classNames('badge', {
          'badge-level1': supporterBadge,
          'badge-level2': patronBadge,
          'badge-level3': advocateBadge,
        })}
        onClick={handleBadgeClick}
        title={roleName}
      >
      </div>
    );
  }

  if (withLink) {
    return (
      <Link
        to={`/@${account?.acct}`}
        title={`@${account?.acct}`}
        data-hover-card-account={account?.id}
      >
        <div className='avatarwrap'>
          {avatar}
          {badge}
        </div>
      </Link>
    );
  }

  return (
    <div className='avatarwrap'>
      {avatar}
      {badge}
    </div>
  );
};

export const AvatarById: React.FC<
  { accountId: string | undefined } & Omit<Props, 'account'>
> = ({ accountId, ...otherProps }) => {
  const account = useAccount(accountId);
  return <Avatar account={account} {...otherProps} />;
};
