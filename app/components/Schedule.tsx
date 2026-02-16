{patientsInSlot.map(p => {
  const xp = calculateXP(p.billing)
  const isExpanded = expandedPatients[p.id] || false

  return (
    <div
      key={p.id}
      draggable
      onDragStart={e => e.dataTransfer.setData("text/plain", p.id)}
      onClick={() => {
        if (!p.editing) {
          setExpandedPatients(prev => ({
            ...prev,
            [p.id]: !prev[p.id],
          }))
        }
      }}
      className={`mb-2 shadow cursor-pointer transition-all duration-300
        ${isExpanded ? "bg-white p-3 h-auto text-black rounded" : "bg-blue-500 p-2 h-[60px] flex items-center justify-center text-white rounded"}`}
    >
      {!isExpanded ? (
        <span className="font-bold">{p.name || "New Patient"}</span>
      ) : (
        <div className="space-y-2">
          {p.editing ? (
            <input
              type="text"
              value={p.name}
              onChange={e =>
                setPatients(prev =>
                  prev.map(pt =>
                    pt.id === p.id ? { ...pt, name: e.target.value } : pt
                  )
                )
              }
              onFocus={e => e.stopPropagation()} // prevents parent click
              onBlur={() =>
                setPatients(prev =>
                  prev.map(pt =>
                    pt.id === p.id ? { ...pt, editing: false } : pt
                  )
                )
              }
              placeholder="Patient name"
              className="w-full px-1 py-1 border rounded"
            />
          ) : (
            <div className="flex justify-between items-center font-bold">
              <span>{p.name}</span>
              <button
                onClick={e => {
                  e.stopPropagation()
                  setPatients(prev =>
                    prev.map(pt =>
                      pt.id === p.id ? { ...pt, editing: true } : pt
                    )
                  )
                }}
                className="text-xs underline"
              >
                Edit
              </button>
            </div>
          )}

          <div className="space-y-1">
            {(
              [
                ["theract", "TherAct"],
                ["neuro", "Neuro"],
                ["therex", "TherEx"],
                ["manual", "Manual"],
                ["gait", "Gait"],
                ["modalities", "Modalities"],
              ] as [keyof BillingUnits, string][]
            ).map(([field, label]) => (
              <div key={field} className="flex justify-between items-center">
                <span>{label}</span>
                <div className="flex gap-1 items-center">
                  <button
                    onClick={() => updateBilling(p.id, field, -1)}
                    className="px-1 bg-gray-200 rounded"
                  >
                    -
                  </button>
                  <span>{p.billing[field]}</span>
                  <button
                    onClick={() => updateBilling(p.id, field, 1)}
                    className="px-1 bg-gray-200 rounded"
                  >
                    +
                  </button>
                </div>
              </div>
            ))}
          </div>

          <div className="font-bold mt-1">XP: {xp}</div>

          <button
            onClick={() => setPatients(prev => prev.filter(pt => pt.id !== p.id))}
            className="mt-1 text-xs underline text-red-600"
          >
            Delete
          </button>
        </div>
      )}
    </div>
  )
})}
