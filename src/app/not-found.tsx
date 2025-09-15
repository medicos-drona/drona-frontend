export default function NotFound() {
  return (
    <main style={{ minHeight: '60vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '2rem' }}>
      <div style={{ textAlign: 'center' }}>
        <h1 style={{ fontSize: '1.5rem', fontWeight: 600, marginBottom: '0.5rem' }}>404 - Page not found</h1>
        <p style={{ color: '#6b7280' }}>Sorry, we couldnt find the page youre looking for.</p>
      </div>
    </main>
  );
}

