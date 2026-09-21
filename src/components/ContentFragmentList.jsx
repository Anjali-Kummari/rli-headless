import ContentFragmentCard from './ContentFragmentCard';

export default function ContentFragmentList({ fragments }) {
  if (!fragments.length) {
    return <p className="empty-state">No content available.</p>;
  }

  return (
    <div className="faq-list">
      {fragments.map((fragment, index) => (
        <ContentFragmentCard
          key={fragment._path || fragment.id || index}
          fragment={fragment}
        />
      ))}
    </div>
  );
}
