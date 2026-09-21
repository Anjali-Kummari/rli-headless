export default function ErrorMessage({ message }) {
  return (
    <div className="error-message" role="alert">
      <span className="error-icon">⚠</span>
      <div>
        <strong>Unable to load content from AEM.</strong>
        {message && <p className="error-detail">{message}</p>}
      </div>
    </div>
  );
}
