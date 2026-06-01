import {
  BarChart3, Users, DollarSign, UserCheck, Megaphone,
  Package, Terminal, Scale, Layers, Globe, Settings,
  ShieldCheck, Database, Cloud, Zap, Mail, FileText,
} from 'lucide-react'

const ICONS = {
  BarChart3, Users, DollarSign, UserCheck, Megaphone,
  Package, Terminal, Scale, Layers, Globe, Settings,
  ShieldCheck, Database, Cloud, Zap, Mail, FileText,
}

export default function AppIcon({ name, size = 24, className = '' }) {
  const Icon = ICONS[name] || Layers
  return <Icon size={size} className={className} strokeWidth={1.75} />
}
