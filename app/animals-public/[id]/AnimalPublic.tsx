import AnimalQRCode from "@/app/dashboard/animals/[id]/AnimalQRCode";

export default function AnimalPublic({ animal }: { animal: any }) {
  return (
    <div className="min-h-screen bg-gray-50 px-6 py-10 flex justify-center items-center">
      <div className="w-full max-w-3xl space-y-8">
        {/* Fotos */}
        {animal.animal_photos?.length > 0 && (
          <div className="grid grid-cols-3 gap-4">
            {animal.animal_photos.map((p: any) => (
              <img
                key={p.id}
                src={p.url}
                className="aspect-square rounded-xl object-cover border"
              />
            ))}
          </div>
        )}

        {/* Cabeçalho */}
        <header className="space-y-1">
          <h1 className="text-3xl font-semibold text-gray-900">
            {animal.name}
          </h1>

          <p className="text-gray-600">
            {animal.species_name}
            {animal.breed && ` • ${animal.breed}`}
          </p>

          {animal.species_name_latin && (
            <p className="italic text-sm text-gray-500">
              {animal.species_name_latin}
            </p>
          )}
        </header>

        {/* Dados */}
        <section className="grid sm:grid-cols-2 gap-4 bg-white rounded-2xl p-6 shadow">
          <Item label="Sexo" value={formatGender(animal.gender)} />
          <Item label="Peso" value={animal.weight && `${animal.weight} g`} />
          <Item label="Nascimento" value={formatDate(animal.birthday)} />
          <Item label="Microchip" value={animal.chip_id} />
          <Item label="Última alimentação" value={formatDate(animal.last_fed)} />
          <Item label="Último manejo" value={formatDate(animal.last_handled)} />
          <Item label="Última troca de pele" value={formatDate(animal.last_shed)} />
          <Item label="Última pesagem" value={formatDate(animal.last_weighed)} />
        </section>

        {/* Descrição */}
        {animal.description && (
          <section className="bg-white rounded-2xl p-6 shadow">
            <h2 className="text-sm font-semibold text-gray-700 mb-2">
              Observações
            </h2>
            <p className="text-gray-600 whitespace-pre-line">
              {animal.description}
            </p>
          </section>
        )}

        {/* QR Code */}
        <section className="bg-emerald-50 border border-emerald-200 rounded-2xl p-6 flex flex-col sm:flex-row items-center gap-6">
          <AnimalQRCode animalId={animal.id} />

          <div>
            <p className="font-semibold text-emerald-800">
              Identificação do animal
            </p>
            <p className="text-sm text-emerald-700">
              Este QR Code leva para esta página pública.
              Pode ser impresso ou usado em identificação física.
            </p>
          </div>
        </section>
      </div>
    </div>
  );
}

function Item({ label, value }: { label: string; value?: string }) {
  if (!value) return null;

  return (
    <div>
      <p className="text-xs text-gray-400">{label}</p>
      <p className="text-sm font-medium text-gray-700">{value}</p>
    </div>
  );
}

function formatDate(date?: string) {
  if (!date) return undefined;
  return new Date(date).toLocaleDateString("pt-BR");
}

function formatGender(value?: string) {
  if (value === "male") return "Macho";
  if (value === "female") return "Fêmea";
  return "Indefinido";
}
