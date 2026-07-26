import { render, screen, fireEvent } from '@testing-library/react-native';
import { EventCategoryFilter } from '../EventCategoryFilter';

describe('EventCategoryFilter', () => {
  it('muestra las 6 categorías con el copy exacto de brand/copies.md', () => {
    render(<EventCategoryFilter value="all" onChange={jest.fn()} />);

    ['Todos', 'Esta semana', 'Pride', 'Social', 'Arte', 'Activismo'].forEach((label) => {
      expect(screen.getByText(label)).toBeTruthy();
    });
  });

  it('marca la opción activa como seleccionada', () => {
    render(<EventCategoryFilter value="pride" onChange={jest.fn()} />);

    expect(screen.getByTestId('event-filter-pride').props.accessibilityState.selected).toBe(true);
    expect(screen.getByTestId('event-filter-all').props.accessibilityState.selected).toBe(false);
  });

  it('llama a onChange con la clave correcta al tocar un chip', () => {
    const onChange = jest.fn();
    render(<EventCategoryFilter value="all" onChange={onChange} />);

    fireEvent.press(screen.getByTestId('event-filter-this_week'));

    expect(onChange).toHaveBeenCalledWith('this_week');
  });
});
