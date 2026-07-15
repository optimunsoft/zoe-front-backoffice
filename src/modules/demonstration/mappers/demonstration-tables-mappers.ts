import { normalizeProductInterest } from "../schema/demonstrations.schema";
import type { DemonstrationResponse, DemonstrationStatus } from "../types/demonstration.types";
import type { UTableColumn, UTableRow } from "~/core/ui/Tables/utable.types";
import { formatTableDate } from "~/shared/utils/format";

const STATUS_LABELS: Record<DemonstrationStatus, string> = {
    PENDIENTE: 'Pendiente',
    EJECUTADA: 'Ejecutada',
    CANCELADA: 'Cancelada',
}

const STATUS_BADGE_COLORS = {
    Pendiente: 'warning',
    Ejecutada: 'success',
    Cancelada: 'danger',
} as const

const formatDemonstrationTime = (value: Date | string): string => {
    const date = new Date(value)
    if (Number.isNaN(date.getTime())) return '-'

    return new Intl.DateTimeFormat('es-CO', {
        hour: '2-digit',
        minute: '2-digit',
        hour12: true,
    }).format(date)
}

const formatDemonstrationPhone = (value?: string | null): string => {
    if (!value?.trim()) return '-'

    const withoutCountryCode = value.trim().replace(/^\+?57\s*/, '')
    const digits = withoutCountryCode.replace(/\D/g, '')

    return digits || '-'
}

export const demonstrationColumns: UTableColumn[] = [
    { key: 'name', label: 'Nombre', toggleable: false, variant: 'emphasis' },
    { key: 'email', label: 'Email' },
    { key: 'scheduledDate', label: 'Fecha' },
    { key: 'scheduledTime', label: 'Hora' },
    { key: 'phone', label: 'Teléfono' },
    {
        key: 'productInterest',
        label: 'Productos de interés',
        type: 'badge',
        align: 'left',
        badgeColorFallback: 'info',
    },
    {
        key: 'status',
        label: 'Estado',
        type: 'badge',
        align: 'center',
        badgeColorMap: STATUS_BADGE_COLORS,
    },
]

export const mapDemonstrationsToTableRows = (demonstrations: DemonstrationResponse[]): UTableRow[] => {
    return demonstrations.map((demonstration) => ({
        id: demonstration.id,
        name: demonstration.name,
        email: demonstration.email,
        scheduledDate: formatTableDate(demonstration.scheduledAt),
        scheduledTime: formatDemonstrationTime(demonstration.scheduledAt),
        phone: formatDemonstrationPhone(demonstration.phone),
        productInterest: normalizeProductInterest(demonstration.productInterest),
        status: STATUS_LABELS[demonstration.status] ?? demonstration.status,
    }));
}