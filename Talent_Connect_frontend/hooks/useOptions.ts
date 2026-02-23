import { useQuery } from '@tanstack/react-query';
import api from '@/lib/api';

/**
 * Fetches a list from an API endpoint and maps it to { value, label } format
 * for use in select/radio dropdowns.
 *
 * @param apiPath  - e.g. 'state', 'qualification', 'program'
 * @param valueKey - The field used as the option value (the PK column)
 * @param labelKey - The field used as the option label (the display name column)
 */
export function useOptions(
    apiPath: string | undefined,
    valueKey: string,
    labelKey: string,
) {
    const { data } = useQuery({
        queryKey: ['options', apiPath, valueKey, labelKey],
        queryFn: async () => {
            if (!apiPath) return [];
            const res = await api.get(`${apiPath}?limit=500`);
            const json = res.data;
            // Support both { data: [] } and plain []
            const list: any[] = Array.isArray(json) ? json : (json.data ?? json.items ?? []);
            return list
                .filter((item) => item.is_active !== 'N')
                .map((item) => ({
                    value: String(item[valueKey]),
                    label: String(item[labelKey] ?? item[valueKey]),
                }));
        },
        enabled: !!apiPath,
        staleTime: 60_000, // 1 min cache
    });
    return data ?? [];
}
