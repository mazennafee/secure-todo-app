// frontend/src/components/Projects/__tests__/ProjectList.test.jsx
import { render, screen, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import ProjectList from '../ProjectList';

describe('ProjectList Component', () => {
    beforeEach(() => {
        global.fetch = jest.fn();
    });

    test('renders loading state initially', () => {
        global.fetch.mockImplementation(() => new Promise(() => { })); // Never resolves
        render(
            <BrowserRouter>
                <ProjectList />
            </BrowserRouter>
        );
        expect(screen.getByText(/loading projects/i)).toBeInTheDocument();
    });

    test('renders projects after successful fetch', async () => {
        const mockProjects = [
            { id: 1, name: 'Test Project', description: 'Test desc', user_role: 'owner' }
        ];

        global.fetch.mockResolvedValueOnce({
            ok: true,
            json: async () => ({ projects: mockProjects })
        });

        render(
            <BrowserRouter>
                <ProjectList />
            </BrowserRouter>
        );

        await waitFor(() => {
            expect(screen.getByText('Test Project')).toBeInTheDocument();
        });
    });

    test('shows empty state when no projects exist', async () => {
        global.fetch.mockResolvedValueOnce({
            ok: true,
            json: async () => ({ projects: [] })
        });

        render(
            <BrowserRouter>
                <ProjectList />
            </BrowserRouter>
        );

        await waitFor(() => {
            expect(screen.getByText(/no projects yet/i)).toBeInTheDocument();
        });
    });
});
