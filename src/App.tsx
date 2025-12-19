import { faker } from '@faker-js/faker';
import { ColumnDef } from '@tanstack/solid-table';
import { createSignal } from 'solid-js';
import Table from './Table';

type Person = {
  firstName: string;
  lastName: string;
  age: number;
  visits: number;
  status: string;
  progress: number;
};

const DUMMY_DATA: Person[] = Array.from({ length: 100 }, (_, i) => ({
  firstName: faker.person.firstName(),
  lastName: faker.person.lastName(),
  age: Math.floor(Math.random() * 100),
  visits: Math.floor(Math.random() * 1000),
  status: ['Single', 'In Relationship', 'Complicated'][Math.floor(Math.random() * 3)],
  progress: Math.floor(Math.random() * 100),
}));

const COLUMNS: ColumnDef<Person>[] = [
  {
    id: 'firstName',
    accessorKey: 'firstName',
    header: 'First Name',
  },
  {
    id: 'lastName',
    accessorKey: 'lastName',
    header: 'Last Name',
  },
  {
    id: 'age',
    accessorKey: 'age',
    header: 'Age',
  },
  {
    id: 'visits',
    accessorKey: 'visits',
    header: 'Visits',
  },
  {
    id: 'status',
    accessorKey: 'status',
    header: 'Status',
  },
  {
    id: 'progress',
    accessorKey: 'progress',
    header: 'Profile Progress',
  },
];

export default function App() {
  const [data, setData] = createSignal(DUMMY_DATA);

  const handleSearch = (e: InputEvent & { currentTarget: HTMLInputElement }) => {
    const value = e.currentTarget.value;
    setData(() =>
      DUMMY_DATA.filter((person) => person.firstName.toLowerCase().includes(value.toLowerCase()))
    );
  };

  return (
    <div class="flex max-w-5xl flex-1 flex-col overflow-hidden p-2">
      <input
        id="search-input"
        name="search"
        type="text"
        onInput={handleSearch}
        placeholder="Type to filter by first name..."
        class="mb-4 w-full border p-2"
      />
      <Table data={data} columns={COLUMNS} />
    </div>
  );
}
