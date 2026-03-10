import { useLayoutEffect, useMemo, useRef, useState } from "react";

const MAX_COLUMNS = 5;

function getBestColumnCount(itemCount) {
  if (!itemCount) return 1;

  const upperBound = Math.min(MAX_COLUMNS, itemCount);
  const perfectFit = [];

  for (let columns = 2; columns <= upperBound; columns += 1) {
    if (itemCount % columns === 0) {
      perfectFit.push(columns);
    }
  }

  if (perfectFit.length > 0) {
    return Math.max(...perfectFit);
  }

  let bestColumns = 1;
  let bestEmptySlots = Number.POSITIVE_INFINITY;

  for (let columns = 2; columns <= upperBound; columns += 1) {
    const rows = Math.ceil(itemCount / columns);
    const emptySlots = rows * columns - itemCount;

    if (
      emptySlots < bestEmptySlots ||
      (emptySlots === bestEmptySlots && columns > bestColumns)
    ) {
      bestColumns = columns;
      bestEmptySlots = emptySlots;
    }
  }

  return bestColumns;
}

export default function DeviceMenu({ device = [], onSelect, anchorRect, containerRect, controlsRect }) {
  const menuRef = useRef(null);
  const [position, setPosition] = useState({ left: 12, top: 0 });

  const columnCount = useMemo(
    () => getBestColumnCount(device.length || 1),
    [device.length]
  );

  useLayoutEffect(() => {
    if (!menuRef.current || !containerRect) return;

    const margin = 12;
    const menuRect = menuRef.current.getBoundingClientRect();
    const rightAnchor = controlsRect?.right ?? anchorRect?.right;
    if (!rightAnchor) return;
    const preferredLeft =
      rightAnchor - containerRect.left - menuRect.width;
    const maxLeft = Math.max(
      margin,
      containerRect.width - menuRect.width - margin
    );
    const nextLeft = Math.min(Math.max(margin, preferredLeft), maxLeft);

    setPosition((prev) =>
      prev.left === nextLeft && prev.top === 0 ? prev : { left: nextLeft, top: 0 }
    );
  }, [anchorRect, containerRect, controlsRect, columnCount, device.length]);

  return (
    <div
      ref={menuRef}
      className="device-menu"
      style={{
        left: position.left,
        top: position.top,
        "--menu-columns": columnCount,
      }}
    >
      <div className="device-menu-grid">
        {device.map((item) => (
          <button
            key={item.id}
            type="button"
            className="device-menu-item"
            onClick={() => onSelect(item)}
          >
            <span className="device-menu-item-label">{item.label}</span>
            <span className="device-menu-item-size">{item.width} x {item.height}</span>
          </button>
        ))}
      </div>
    </div>
  );
}
