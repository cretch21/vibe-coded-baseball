export function Footer() {
  return (
    <footer className="bg-primary-900 border-t border-primary-700">
      <div className="container mx-auto px-4 py-6">
        <div className="flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="text-gray-500 text-sm">
            <p>Data powered by Statcast via pybaseball</p>
          </div>
          <div className="text-gray-500 text-sm text-center md:text-right">
            <p>
              Built by{" "}
              <span className="text-accent">Robert Stock</span>
              {" • "}
              <span className="text-gray-400">Stockyard Baseball Co.</span>
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
}
