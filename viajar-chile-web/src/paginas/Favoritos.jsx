export default function Favoritos() {
  const user = JSON.parse(localStorage.getItem("user") || "null");

  return (
    <div className="mx-auto w-full max-w-screen-xl px-4 py-8">
      <h1 className="text-2xl font-bold">Tus lugares guardados</h1>
      <p className="text-gray-600 mb-6">Hola {user?.nombre || user?.correo}, aquí verás tus favoritos.</p>

      <div className="rounded-xl border bg-white p-4 shadow-sm">
        <p className="text-sm text-gray-600">Aún no tienes favoritos. Agrega algunos desde la búsqueda.</p>
      </div>
    </div>
  );
}
