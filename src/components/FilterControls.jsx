// Shared day-type + date-range controls. Extra controls can be passed as children.
export default function FilterControls({ value, onChange, children, showDayType = true }) {
  const set = (patch) => onChange({ ...value, ...patch });
  return (
    <div className="controls">
      {showDayType && (
        <div className="field">
          <label>Days</label>
          <select value={value.dayType} onChange={(e) => set({ dayType: e.target.value })}>
            <option value="both">Both</option>
            <option value="weekday">Weekdays</option>
            <option value="weekend">Weekends</option>
          </select>
        </div>
      )}
      <div className="field">
        <label>Start date</label>
        <input type="date" value={value.start} onChange={(e) => set({ start: e.target.value })} />
      </div>
      <div className="field">
        <label>End date</label>
        <input type="date" value={value.end} onChange={(e) => set({ end: e.target.value })} />
      </div>
      {children}
      {(value.start || value.end || value.dayType !== 'both') && (
        <button
          className="btn ghost"
          onClick={() => set({ dayType: 'both', start: '', end: '' })}
        >
          reset
        </button>
      )}
    </div>
  );
}
