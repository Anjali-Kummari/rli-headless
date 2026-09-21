import { useState } from 'react';

const _rawUrl = import.meta.env.VITE_AEM_GRAPHQL_URL ?? '';
const AEM_HOST = _rawUrl.startsWith('http')
  ? new URL(_rawUrl).origin
  : 'https://publish-p221102-e2272119.adobeaemcloud.com';

const KNOWN_TITLE_FIELDS = ['title', 'heading', 'name', 'question'];
const KNOWN_BODY_FIELDS = ['description', 'body', 'text', 'content', 'summary', 'answer', 'details'];
const KNOWN_IMAGE_FIELDS = ['image', 'featuredImage', 'thumbnail', 'photo'];
const KNOWN_LINK_FIELDS = ['link', 'url', 'ctaUrl', 'externalUrl', 'href'];
const KNOWN_BADGE_FIELDS = ['category', 'type', 'tag', 'label', 'badge'];

function resolveImageUrl(imageField) {
  if (!imageField) return null;
  if (typeof imageField === 'string') return imageField.startsWith('http') ? imageField : `${AEM_HOST}${imageField}`;
  const path = imageField._path || imageField.src || imageField.url || imageField._publishUrl;
  if (!path) return null;
  return path.startsWith('http') ? path : `${AEM_HOST}${path}`;
}

function resolveTitle(fragment) {
  for (const key of KNOWN_TITLE_FIELDS) {
    if (fragment[key] && typeof fragment[key] === 'string') return fragment[key];
  }
  if (fragment._path) return fragment._path.split('/').pop().replace(/-/g, ' ');
  return 'Content Fragment';
}

function resolveBody(fragment) {
  for (const key of KNOWN_BODY_FIELDS) {
    const val = fragment[key];
    if (!val) continue;
    if (typeof val === 'string') return val;
    if (typeof val === 'object' && (val.html || val.plaintext)) return val.html || val.plaintext;
  }
  return null;
}

function resolveImage(fragment) {
  for (const key of KNOWN_IMAGE_FIELDS) {
    const url = resolveImageUrl(fragment[key]);
    if (url) return url;
  }
  return null;
}

function resolveLink(fragment) {
  for (const key of KNOWN_LINK_FIELDS) {
    if (fragment[key] && typeof fragment[key] === 'string') return fragment[key];
  }
  return null;
}

function GenericFields({ fragment }) {
  const handled = new Set([
    ...KNOWN_TITLE_FIELDS, ...KNOWN_BODY_FIELDS, ...KNOWN_IMAGE_FIELDS,
    ...KNOWN_LINK_FIELDS, ...KNOWN_BADGE_FIELDS, '_path', '_metadata', '__typename',
    ...KNOWN_BADGE_FIELDS,
  ]);
  const extras = Object.entries(fragment).filter(([key, val]) =>
    !handled.has(key) && val !== null && val !== undefined
  );
  if (!extras.length) return null;
  return (
    <dl className="faq__extras">
      {extras.map(([key, val]) => (
        <div key={key} className="faq__extra-row">
          <dt>{key}:</dt>
          <dd>{typeof val === 'object' ? JSON.stringify(val) : String(val)}</dd>
        </div>
      ))}
    </dl>
  );
}

export default function ContentFragmentCard({ fragment }) {
  const [open, setOpen] = useState(false);
  const title = resolveTitle(fragment);
  const body = resolveBody(fragment);
  const imageUrl = resolveImage(fragment);
  const link = resolveLink(fragment);

  return (
    <div className={`faq-item${open ? ' faq-item--open' : ''}`}>
      <button
        className="faq-item__question"
        onClick={() => setOpen((o) => !o)}
        aria-expanded={open}
      >
        <span>{title}</span>
        <svg className="faq-item__chevron" width="20" height="20" viewBox="0 0 20 20" fill="none" aria-hidden="true">
          <path d="M5 7.5L10 12.5L15 7.5" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
      </button>

      {open && (
        <div className="faq-item__answer">
          {imageUrl && <img src={imageUrl} alt={title} className="faq-item__image" loading="lazy" />}
          {body && (
            typeof body === 'string' && body.startsWith('<')
              ? <div dangerouslySetInnerHTML={{ __html: body }} />
              : <p>{body}</p>
          )}
          <GenericFields fragment={fragment} />
          {link && (
            <a href={link} className="faq-item__link" target="_blank" rel="noopener noreferrer">
              Learn more →
            </a>
          )}
        </div>
      )}
    </div>
  );
}
