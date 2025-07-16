import { useState, useEffect } from 'react';
import { Input } from '@/components/ui/input';
import { userApi } from '@/lib/api/services/user';
import { User } from '@/lib/api/types/common';
import { useNavigate } from 'react-router-dom';

export default function ProfessionalList() {
  const [professionals, setProfessionals] = useState<User[]>([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    loadProfessionals();
  }, []);

  const loadProfessionals = async () => {
    setLoading(true);
    try {
      // Ajuste o role conforme o valor correto do backend
      const data = await userApi.list({ role: 'health_professional' });
      setProfessionals(data);
    } catch (err) {
      setProfessionals([]);
    } finally {
      setLoading(false);
    }
  };

  const filtered = professionals.filter(p => p.name.toLowerCase().includes(search.toLowerCase()));

  console.log(filtered);
  

  return (
    <div className="bg-white dark:bg-background rounded shadow p-4">
      <div className="flex justify-between items-center mb-4">
        <Input
          placeholder="Buscar nome do profissional"
          className="w-64"
          value={search}
          onChange={e => setSearch(e.target.value)}
        />
      </div>
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b">
            <th className="text-left py-2 px-2">Profissional</th>
            <th className="text-left py-2 px-2">Status</th>
            <th className="text-left py-2 px-2">Regras de agenda</th>
          </tr>
        </thead>
        <tbody>
          {filtered.map(prof => (
            <tr
              key={prof.id}
              className="border-b hover:bg-gray-50 dark:hover:bg-gray-800 cursor-pointer group"
              onClick={() => navigate(`/settings/executors/${prof.id}`)}
            >
              <td className="py-2 px-2">{prof.name}</td>
              <td className="py-2 px-2">{prof.status === 'active' ? 'Ativo' : 'Inativo'}</td>
              <td className="py-2 px-2">Sem regras ativas</td>
            </tr>
          ))}
          {filtered.length === 0 && (
            <tr>
              <td colSpan={3} className="text-center py-8 text-gray-400">Nenhum profissional encontrado.</td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
} 