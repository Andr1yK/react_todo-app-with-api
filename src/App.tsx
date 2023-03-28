/* eslint-disable jsx-a11y/control-has-associated-label */
import React, { useState, useEffect } from 'react';
import classNames from 'classnames';
import { Todo } from './types/Todo';
import {
  deleteTodo,
  getTodos,
  patchTodo,
  postTodo,
} from './api/todos';
import { TodoList } from './components/TodoList';

const USER_ID = 6616;

export const App: React.FC = () => {
  const [todos, setTodos] = useState<Todo[]>([]);
  const [error, setError] = useState('');
  const [query, setQuery] = useState('');
  const [disabledInput, setDisabledInput] = useState(false);
  const [tempTodo, setTempTodo] = useState<Todo>();
  const [loadingIds, setLoadingIds] = useState<number[]>([]);

  const closeError = () => {
    setError('');
  };

  const addTodo = (title: string) => {
    setDisabledInput(true);

    const newTodo = {
      title,
      userId: USER_ID,
      completed: false,
    };

    setTempTodo({ ...newTodo, id: 0 });

    postTodo(newTodo)
      .then(result => {
        setTodos(state => [...state, result]);
      })
      .catch(() => {
        setError('Unable to add a todo');
        setTimeout(() => {
          setError('');
        }, 3000);
      })
      .finally(() => {
        setDisabledInput(false);
        setTempTodo(undefined);
      });
  };

  const removeTodo = (id: number) => {
    setLoadingIds(state => [...state, id]);

    return deleteTodo(id)
      .then(() => {
        setTodos(todos.filter(todo => todo.id !== id));
      })
      .catch(() => {
        setError('Unable to delete a todo');
        setTimeout(() => {
          setError('');
        }, 3000);
      })
      .finally(() => {
        setLoadingIds([]);
      });
  };

  const removeCompleted = () => {
    const completed = todos.filter(todo => todo.completed);

    completed.forEach(todo => {
      deleteTodo(todo.id)
        .then(() => {
          setTodos(todos.filter(task => !task.completed));
        })
        .catch(() => {
          setError('Unable to delete todos');
        });
    });
  };

  const handleInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setQuery(event.target.value);
  };

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();

    if (!query.trim()) {
      setError('Tittle can not be empty');
      setTimeout(() => {
        setError('');
      }, 3000);

      return;
    }

    addTodo(query.trim());
    setQuery('');
  };

  const handleUpdate = (id: number, data: Partial<Todo>) => {
    setLoadingIds(state => [...state, id]);

    return patchTodo(id, data)
      .then(() => {
        setTodos(state => state.map(todo => {
          if (todo.id === id) {
            return { ...todo, ...data };
          }

          return todo;
        }));
      })
      .catch(() => {
        setError('Unable to update a todo');
        setTimeout(() => {
          setError('');
        }, 3000);
      })
      .finally(() => {
        setLoadingIds(state => state.filter(el => el !== id));
      });
  };

  const handleToggleAll = () => {
    const areAllDone = todos.every(todo => todo.completed);

    if (areAllDone) {
      todos.forEach(el => {
        handleUpdate(el.id, { completed: false });
      });
    } else {
      const notDoneTodos = todos.filter(el => !el.completed);

      notDoneTodos.forEach(element => {
        handleUpdate(element.id, { completed: true });
      });
    }
  };

  useEffect(() => {
    getTodos(USER_ID)
      .then((result) => {
        setTodos(result);
      })
      .catch(() => {
        setError('load');
        setTimeout(() => {
          setError('');
        }, 3000);
      });
  }, []);

  return (
    <div className="todoapp">
      <h1 className="todoapp__title">todos</h1>

      <div className="todoapp__content">
        <header className="todoapp__header">
          <button
            type="button"
            className="todoapp__toggle-all active"
            onClick={handleToggleAll}
          />

          <form onSubmit={handleSubmit}>
            <input
              type="text"
              className="todoapp__new-todo"
              placeholder="What needs to be done?"
              value={query}
              onChange={handleInputChange}
              disabled={disabledInput}
            />
          </form>
        </header>

        {todos.length > 0 && (
          <TodoList
            todos={todos}
            tempTodo={tempTodo}
            onDelete={removeTodo}
            loadingIds={loadingIds}
            onDeleteCompleted={removeCompleted}
            onUpdateTodo={handleUpdate}
          />
        )}
      </div>

      <div className={classNames(
        'notification is-danger is-light has-text-weight-normal',
        { hidden: !error },
      )}
      >
        <button
          type="button"
          className="delete"
          onClick={closeError}
        />

        {error}
      </div>
    </div>
  );
};
