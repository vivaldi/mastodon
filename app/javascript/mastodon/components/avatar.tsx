import { useState, useCallback } from 'react';

import classNames from 'classnames';

import { useHovering } from 'mastodon/../hooks/useHovering';
import { autoPlayGif } from 'mastodon/initial_state';
import type { Account } from 'mastodon/models/account';

interface Props {
  account: Account | undefined; // FIXME: remove `undefined` once we know for sure its always there
  size: number;
  style?: React.CSSProperties;
  inline?: boolean;
  animate?: boolean;
  counter?: number | string;
  counterBorderColor?: string;
}

export const Avatar: React.FC<Props> = ({
  account,
  animate = autoPlayGif,
  size = 20,
  inline = false,
  style: styleFromParent,
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

  const src =
    hovering || animate
      ? account?.get('avatar')
      : account?.get('avatar_static');

  const handleLoad = useCallback(() => {
    setLoading(false);
  }, [setLoading]);

  const handleError = useCallback(() => {
    setError(true);
  }, [setError]);

  let supporterBadge = false, patronBadge = false, advocateBadge = false, roleName = null;
  if (account?.get('roles')) {
    account?.get('roles').map((role) => {
      if (role.get('name') == 'Vivaldi Supporter') {
        supporterBadge = true;
        roleName = 'Vivaldi Supporter';
      } else if (role.get('name') == 'Vivaldi Patron') {
        patronBadge = true;
        roleName = 'Vivaldi Patron';
      } else if (role.get('name') == 'Vivaldi Advocate') {
        advocateBadge = true;
        roleName = 'Vivaldi Advocate';
      }
    });
  }
  if (roleName === null) {
    return (
      <div className='avatarwrap'>
        <div
          className={classNames('account__avatar', {
            'account__avatar--inline': inline,
            'account__avatar--loading': loading,
          })}
          onMouseEnter={handleMouseEnter}
          onMouseLeave={handleMouseLeave}
          style={style}
        >
          {src && <img src={src} alt='' />}
          {counter && (
            <div
              className='account__avatar__counter'
              style={{ borderColor: counterBorderColor }}
            >
              {counter}
            </div>
          )}
        </div>
      </div>
    );
  } else {
    return (
      <div className='avatarwrap'>
        <div
          className={classNames('account__avatar', {
            'account__avatar--inline': inline,
            'account__avatar--loading': loading,
          })}
          onMouseEnter={handleMouseEnter}
          onMouseLeave={handleMouseLeave}
          style={style}
        >
          {src && <img src={src} alt='' />}
          {counter && (
            <div
              className='account__avatar__counter'
              style={{ borderColor: counterBorderColor }}
            >
              {counter}
            </div>
          )}
        </div>
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
      </div>
    );
  }
};
