import { ROUTES } from '@/lib/routes';
import { BackLink, Badge, Card, PageTitle } from '@/components/ui';

export function ComingSoon({ title }: { title: string }) {
    return <>
        <BackLink to={ROUTES.exercises}>Ejercicios</BackLink>
        <PageTitle eyebrow="PRÓXIMAMENTE" title={title} text="Estamos preparando y revisando los ejercicios de este módulo."/>
        <Card><Badge>PRÓXIMAMENTE</Badge><p className="mt-4 text-sm text-muted">El contenido estará disponible cuando termine la revisión. Mientras tanto, puedes revisar los ejercicios de Digitación y coordinación.</p></Card>
    </>;
}
