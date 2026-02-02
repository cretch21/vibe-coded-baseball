export function Footer() {
  return (
    <footer className="px-4 pb-4 mt-4">
      <div className="container mx-auto">
        <div className="rounded-lg p-4 border-t" style={{ borderColor: '#E1C825' }}>
          <div className="flex flex-col md:flex-row items-center justify-between gap-4 text-gray-400 text-sm">
            <p>Data powered by Statcast via pybaseball</p>
            <p>
              Built by{" "}
              <span className="font-medium" style={{ color: '#E1C825' }}>Robert Stock</span>
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
}
