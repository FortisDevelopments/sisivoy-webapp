import React, { useEffect, useCallback } from "react";
import {
  Card,
  Row,
  Col,
  Statistic,
  Spin,
  Alert,
  Typography,
  Space,
  Tag,
  Button,
} from "antd";
import {
  UserOutlined,
  ShopOutlined,
  TeamOutlined,
  CheckCircleOutlined,
  ClockCircleOutlined,
  ReloadOutlined,
} from "@ant-design/icons";
import { Column, Pie } from "@ant-design/charts";
import { usersService } from "../services/usersService";
import { storesService } from "../services/storesService";
import { useAuth } from "../hooks/useAuth";
import { useUsersStore } from "../stores/usersStore";
import { useStoresStore } from "../stores/storesStore";
import { useDashboardStore } from "../stores/dashboardStore";

const { Title } = Typography;

interface User {
  id: number;
  name: string;
  email: string;
  role: string;
  is_active: number;
  created_at: string | null;
}

interface Store {
  id: number;
  name: string;
  store_type: string;
  is_active: number;
  owner_is_active: boolean;
  created_at: string | null;
}

const DashboardView: React.FC = () => {
  console.log("DashboardView component rendering");
  const { user, accessToken } = useAuth();

  // Estado del store
  const {
    stats,
    loading,
    error,
    isDataLoaded,
    setLoading,
    setError,
    updateStats,
    setDataLoaded,
  } = useDashboardStore();

  const loadDashboardData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      // Configurar tokens de acceso
      if (!accessToken) {
        throw new Error("No hay token de acceso disponible");
      }

      usersService.setAccessToken(accessToken);
      storesService.setAccessToken(accessToken);

      // Cargar datos de usuarios y tiendas
      await Promise.all([
        usersService.fetchUsers({ page: 1, limit: 1000 }),
        storesService.fetchStores({ page: 1, limit: 1000 }),
      ]);

      // Obtener datos de los stores
      const usersStore = useUsersStore.getState();
      const storesStore = useStoresStore.getState();

      const users = usersStore.users;
      const stores = storesStore.stores;

      // Calcular estadísticas
      const totalUsers = users.length;
      const totalStores = stores.length;

      const activeUsers = users.filter((u: User) => u.is_active === 1).length;
      const activeStores = stores.filter(
        (s: Store) => s.is_active === 1
      ).length;

      // Estadísticas por rol de usuario
      const roleCounts: { [key: string]: number } = {};
      users.forEach((u: User) => {
        roleCounts[u.role] = (roleCounts[u.role] || 0) + 1;
      });
      const usersByRole = Object.entries(roleCounts).map(([role, count]) => ({
        role,
        count: count as number,
      }));

      // Estadísticas por tipo de tienda
      const typeCounts: { [key: string]: number } = {};
      stores.forEach((s: Store) => {
        typeCounts[s.store_type] = (typeCounts[s.store_type] || 0) + 1;
      });
      const storesByType = Object.entries(typeCounts).map(([type, count]) => ({
        type,
        count: count as number,
      }));

      // Usuarios recientes (últimos 30 días)
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
      const recentUsers = users.filter((u: User) => {
        if (!u.created_at) return false;
        return new Date(u.created_at) >= thirtyDaysAgo;
      }).length;

      // Tiendas recientes (últimos 30 días)
      const recentStores = stores.filter((s: Store) => {
        if (!s.created_at) return false;
        return new Date(s.created_at) >= thirtyDaysAgo;
      }).length;

      updateStats({
        totalUsers,
        totalStores,
        activeUsers,
        activeStores,
        usersByRole,
        storesByType,
        recentUsers,
        recentStores,
      });
    } catch (err) {
      console.error("Error al cargar datos del dashboard:", err);
      setError(err instanceof Error ? err.message : "Error desconocido");
    } finally {
      setLoading(false);
    }
  }, [accessToken, setError, setLoading, updateStats]);

  const handleRefresh = async () => {
    try {
      // Marcar como no cargado para forzar la recarga
      setDataLoaded(false);
      await loadDashboardData();
    } catch (error) {
      console.error("Error al actualizar datos:", error);
    }
  };

  // Configurar el token en el servicio y cargar datos si es necesario
  useEffect(() => {
    if (accessToken) {
      usersService.setAccessToken(accessToken);
      storesService.setAccessToken(accessToken);

      // Solo cargar datos si no han sido cargados previamente
      if (!isDataLoaded) {
        loadDashboardData().catch((error) => {
          console.error("Error inicial:", error);
        });
      }
    }
  }, [accessToken, isDataLoaded, loadDashboardData]);

  if (!accessToken) {
    return (
      <Alert
        message="No hay sesión activa"
        description="Por favor, inicia sesión para ver las estadísticas del dashboard."
        type="warning"
        showIcon
      />
    );
  }

  if (loading) {
    return (
      <div style={{ textAlign: "center", padding: "50px" }}>
        <Spin size="large" />
        <p>Cargando estadísticas del dashboard...</p>
      </div>
    );
  }

  if (error) {
    return (
      <Alert
        message="Error al cargar datos"
        description={error}
        type="error"
        showIcon
        action={<button onClick={loadDashboardData}>Reintentar</button>}
      />
    );
  }

  // Configuración para gráfica de usuarios por rol
  const usersByRoleConfig = {
    data: stats.usersByRole,
    xField: "role",
    yField: "count",
    label: {
      position: "middle",
      style: {
        fill: "#FFFFFF",
        opacity: 0.6,
      },
    },
    xAxis: {
      label: {
        autoHide: true,
        autoRotate: false,
      },
    },
    meta: {
      role: {
        alias: "Rol",
      },
      count: {
        alias: "Cantidad",
      },
    },
  };

  // Configuración para gráfica de tiendas por tipo
  const storesByTypeConfig = {
    data: stats.storesByType,
    angleField: "count",
    colorField: "type",
    radius: 0.8,
    label: {
      type: "outer",
      content: "{name} ({percentage})",
    },
    interactions: [
      {
        type: "element-active",
      },
    ],
  };

  return (
    <div>
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: 24,
        }}
      >
        <div>
          <Title level={2} style={{ margin: 0 }}>
            Dashboard de Administración
          </Title>
          <p style={{ margin: "8px 0 0 0" }}>
            Bienvenido, {user?.name}. Aquí tienes un resumen de las estadísticas
            del sistema.
          </p>
        </div>
        <Button
          type="primary"
          icon={<ReloadOutlined />}
          onClick={handleRefresh}
          loading={loading}
          size="large"
        >
          Actualizar
        </Button>
      </div>

      {/* Tarjetas de estadísticas principales */}
      <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic
              title="Total de Usuarios"
              value={stats.totalUsers}
              prefix={<UserOutlined />}
              valueStyle={{ color: "#1890ff" }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic
              title="Total de Tiendas"
              value={stats.totalStores}
              prefix={<ShopOutlined />}
              valueStyle={{ color: "#52c41a" }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic
              title="Usuarios Activos"
              value={stats.activeUsers}
              prefix={<CheckCircleOutlined />}
              valueStyle={{ color: "#52c41a" }}
            />
            <div style={{ marginTop: 8 }}>
              <Tag color="green">
                {stats.totalUsers > 0
                  ? Math.round((stats.activeUsers / stats.totalUsers) * 100)
                  : 0}
                % activos
              </Tag>
            </div>
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic
              title="Tiendas Activas"
              value={stats.activeStores}
              prefix={<TeamOutlined />}
              valueStyle={{ color: "#52c41a" }}
            />
            <div style={{ marginTop: 8 }}>
              <Tag color="green">
                {stats.totalStores > 0
                  ? Math.round((stats.activeStores / stats.totalStores) * 100)
                  : 0}
                % activas
              </Tag>
            </div>
          </Card>
        </Col>
      </Row>

      {/* Estadísticas de usuarios y tiendas inactivas */}
      <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
        <Col xs={24} sm={12}>
          <Card>
            <Statistic
              title="Usuarios Inactivos"
              value={stats.totalUsers - stats.activeUsers}
              prefix={<UserOutlined />}
              valueStyle={{ color: "#ff4d4f" }}
            />
            <div style={{ marginTop: 8 }}>
              <Tag color="red">
                {stats.totalUsers > 0
                  ? Math.round(
                      ((stats.totalUsers - stats.activeUsers) /
                        stats.totalUsers) *
                        100
                    )
                  : 0}
                % inactivos
              </Tag>
            </div>
          </Card>
        </Col>
        <Col xs={24} sm={12}>
          <Card>
            <Statistic
              title="Tiendas Inactivas"
              value={stats.totalStores - stats.activeStores}
              prefix={<ShopOutlined />}
              valueStyle={{ color: "#ff4d4f" }}
            />
            <div style={{ marginTop: 8 }}>
              <Tag color="red">
                {stats.totalStores > 0
                  ? Math.round(
                      ((stats.totalStores - stats.activeStores) /
                        stats.totalStores) *
                        100
                    )
                  : 0}
                % inactivas
              </Tag>
            </div>
          </Card>
        </Col>
      </Row>

      {/* Estadísticas adicionales */}
      <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
        <Col xs={24} sm={12}>
          <Card>
            <Statistic
              title="Usuarios Nuevos (30 días)"
              value={stats.recentUsers}
              prefix={<ClockCircleOutlined />}
              valueStyle={{ color: "#fa8c16" }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12}>
          <Card>
            <Statistic
              title="Tiendas Nuevas (30 días)"
              value={stats.recentStores}
              prefix={<ClockCircleOutlined />}
              valueStyle={{ color: "#fa8c16" }}
            />
          </Card>
        </Col>
      </Row>

      {/* Gráficas */}
      <Row gutter={[16, 16]}>
        <Col xs={24} lg={12}>
          <Card
            title="Distribución de Usuarios por Rol"
            style={{ height: 400 }}
          >
            {stats.usersByRole.length > 0 ? (
              <Column {...usersByRoleConfig} height={300} />
            ) : (
              <div style={{ textAlign: "center", padding: "50px" }}>
                <p>No hay datos de usuarios disponibles</p>
              </div>
            )}
          </Card>
        </Col>
        <Col xs={24} lg={12}>
          <Card
            title="Distribución de Tiendas por Tipo"
            style={{ height: 400 }}
          >
            {stats.storesByType.length > 0 ? (
              <Pie {...storesByTypeConfig} height={300} />
            ) : (
              <div style={{ textAlign: "center", padding: "50px" }}>
                <p>No hay datos de tiendas disponibles</p>
              </div>
            )}
          </Card>
        </Col>
      </Row>

      {/* Resumen de actividad */}
      <Row gutter={[16, 16]} style={{ marginTop: 24 }}>
        <Col span={24}>
          <Card title="Resumen de Actividad">
            <Space direction="vertical" size="large" style={{ width: "100%" }}>
              <div>
                <Title level={4}>Estado General del Sistema</Title>
                <Row gutter={[16, 16]}>
                  <Col span={8}>
                    <div style={{ textAlign: "center" }}>
                      <div
                        style={{
                          fontSize: "24px",
                          fontWeight: "bold",
                          color: "#1890ff",
                        }}
                      >
                        {stats.totalUsers}
                      </div>
                      <div>Usuarios Registrados</div>
                    </div>
                  </Col>
                  <Col span={8}>
                    <div style={{ textAlign: "center" }}>
                      <div
                        style={{
                          fontSize: "24px",
                          fontWeight: "bold",
                          color: "#52c41a",
                        }}
                      >
                        {stats.totalStores}
                      </div>
                      <div>Tiendas Registradas</div>
                    </div>
                  </Col>
                  <Col span={8}>
                    <div style={{ textAlign: "center" }}>
                      <div
                        style={{
                          fontSize: "24px",
                          fontWeight: "bold",
                          color: "#fa8c16",
                        }}
                      >
                        {stats.recentUsers + stats.recentStores}
                      </div>
                      <div>Nuevos Registros (30 días)</div>
                    </div>
                  </Col>
                </Row>
              </div>
            </Space>
          </Card>
        </Col>
      </Row>
    </div>
  );
};

export default DashboardView;
