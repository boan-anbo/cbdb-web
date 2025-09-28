import React from 'react';
import { useSelection } from '../../../contexts/SelectionContext';
import { createSelectableItem } from '../entities';
import { useSelectable } from '../hooks';
import { cn } from '../../../lib/utils';

// Sample data for demo
const samplePeople = [
  { id: 1762, name: 'Wang Anshi', nameChn: '王安石', dynastyName: 'Song', birthYear: 1021, deathYear: 1086 },
  { id: 1763, name: 'Su Shi', nameChn: '蘇軾', dynastyName: 'Song', birthYear: 1037, deathYear: 1101 },
  { id: 1764, name: 'Ouyang Xiu', nameChn: '歐陽修', dynastyName: 'Song', birthYear: 1007, deathYear: 1072 },
];

const sampleTexts = [
  { id: 101, title: 'Poems', titleChn: '詩集', author: 'Wang Anshi', authorChn: '王安石', year: 1070, textType: 'Poetry' },
  { id: 102, title: 'Essays', titleChn: '文集', author: 'Su Shi', authorChn: '蘇軾', year: 1080, textType: 'Prose' },
];

const samplePlaces = [
  { id: 201, name: 'Kaifeng', nameChn: '開封', type: 'Capital', belongsTo: 'Henan', belongsToChn: '河南', latitude: 34.7, longitude: 114.3 },
  { id: 202, name: 'Hangzhou', nameChn: '杭州', type: 'Prefecture', belongsTo: 'Zhejiang', belongsToChn: '浙江', latitude: 30.2, longitude: 120.1 },
];

const sampleOffices = [
  { id: 301, title: 'Grand Chancellor', titleChn: '宰相', type: 'Executive', dynasty: 'Song', startYear: 1070, endYear: 1076 },
  { id: 302, title: 'Prefect', titleChn: '知州', type: 'Regional', dynasty: 'Song', startYear: 1080, endYear: 1085 },
];

interface DemoItemProps {
  item: any;
  type: 'person' | 'text' | 'place' | 'office';
}

const DemoItem: React.FC<DemoItemProps> = ({ item, type }) => {
  const selectableItem = React.useMemo(() => {
    switch (type) {
      case 'person':
        return createSelectableItem.person(item);
      case 'text':
        return createSelectableItem.text(item);
      case 'place':
        return createSelectableItem.place(item);
      case 'office':
        return createSelectableItem.office(item);
    }
  }, [item, type]);

  const { selected, handleSelect } = useSelectable({ item: selectableItem });

  const Icon = selectableItem.icon;

  return (
    <div
      onClick={handleSelect}
      className={cn(
        'flex items-center gap-3 p-3 rounded-lg cursor-pointer transition-colors',
        'hover:bg-gray-100 dark:hover:bg-gray-800',
        selected && 'bg-blue-50 dark:bg-blue-900/20 ring-2 ring-blue-500'
      )}
    >
      <Icon className="w-5 h-5 text-gray-500 dark:text-gray-400" />
      <div className="flex-1">
        <div className="font-medium">{selectableItem.label}</div>
        {selectableItem.sublabel && (
          <div className="text-sm text-gray-500 dark:text-gray-400">
            {selectableItem.sublabel}
          </div>
        )}
      </div>
      {selected && (
        <div className="text-xs text-blue-600 dark:text-blue-400 font-medium">
          Selected
        </div>
      )}
    </div>
  );
};

export const SelectorDemo: React.FC = () => {
  const { count, clear } = useSelection();

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">Selector Demo</h2>
        <div className="flex items-center gap-4">
          <span className="text-sm text-gray-500">
            {count} items selected
          </span>
          {count > 0 && (
            <button
              onClick={clear}
              className="px-3 py-1 text-sm bg-gray-200 dark:bg-gray-700 rounded hover:bg-gray-300 dark:hover:bg-gray-600"
            >
              Clear All
            </button>
          )}
        </div>
      </div>

      <div className="text-sm text-gray-600 dark:text-gray-400 space-y-1">
        <p>• Click to select/replace</p>
        <p>• Cmd/Ctrl+Click to toggle selection</p>
        <p>• Shift+Click for range selection (in lists)</p>
        <p>• Escape to clear all selections</p>
      </div>

      <div className="grid grid-cols-2 gap-6">
        <div className="space-y-3">
          <h3 className="font-semibold text-lg">People</h3>
          <div className="space-y-2">
            {samplePeople.map(person => (
              <DemoItem key={person.id} item={person} type="person" />
            ))}
          </div>
        </div>

        <div className="space-y-3">
          <h3 className="font-semibold text-lg">Texts</h3>
          <div className="space-y-2">
            {sampleTexts.map(text => (
              <DemoItem key={text.id} item={text} type="text" />
            ))}
          </div>
        </div>

        <div className="space-y-3">
          <h3 className="font-semibold text-lg">Places</h3>
          <div className="space-y-2">
            {samplePlaces.map(place => (
              <DemoItem key={place.id} item={place} type="place" />
            ))}
          </div>
        </div>

        <div className="space-y-3">
          <h3 className="font-semibold text-lg">Offices</h3>
          <div className="space-y-2">
            {sampleOffices.map(office => (
              <DemoItem key={office.id} item={office} type="office" />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};