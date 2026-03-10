import React, { useEffect, useRef, useCallback, useState } from "react";
import {
  Table,
  Card,
  Input,
  Select,
  Button,
  Space,
  Tag,
  Avatar,
  Pagination,
  Row,
  Col,
  Typography,
  message,
  Spin,
  Tooltip,
  Modal,
  Image,
} from "antd";
import {
  SearchOutlined,
  ReloadOutlined,
  UserOutlined,
  CheckCircleOutlined,
  StopOutlined,
  EyeOutlined,
} from "@ant-design/icons";
import { useUsersStore } from "../stores/usersStore";
import { usersService } from "../services/usersService";
import { useAuth } from "../hooks/useAuth";
import { httpInterceptor } from "../utils/httpInterceptor";
import { API_BASE_URL } from "../API";
import type { AdminUser } from "../API";

const { Title } = Typography;
const { Option } = Select;

// Email del administrador principal que no puede ser desactivado
const PROTECTED_ADMIN_EMAIL = "adminweb@email.com";

const UsersView: React.FC = () => {
  console.log("UsersView component rendering");
  const { accessToken } = useAuth();
  const searchInputRef = useRef<string>("");
  const debounceTimeoutRef = useRef<number | null>(null);
  const initialLoadRef = useRef<boolean>(false);

  // Estado del store
  const {
    users,
    pagination,
    filters,
    loading,
    clearing,
    error,
    updateSearch,
    applyLocalFilters,
  } = useUsersStore();

  const filtersRef = useRef(filters);

  // Estado para el modal de imagen de usuario
  const [userImageModalVisible, setUserImageModalVisible] = useState(false);
  const [userImageUrl, setUserImageUrl] = useState<string>("");
  const [userIdForImage, setUserIdForImage] = useState<number | null>(null);
  const [deletingImage, setDeletingImage] = useState(false);

  // useCallback para applyLocalFilters para evitar bucles infinitos
  const applyLocalFiltersCallback = useCallback(() => {
    applyLocalFilters();
  }, [applyLocalFilters]);

  // Configurar el token en el servicio
  useEffect(() => {
    if (accessToken && !initialLoadRef.current) {
      usersService.setAccessToken(accessToken);
      // Solo cargar datos si no hay usuarios cargados
      if (users.length === 0) {
        initialLoadRef.current = true;
        usersService
          .fetchUsers(filtersRef.current)
          .then(() => {
            // Después de cargar datos, aplicar filtros locales si hay alguno activo
            if (filtersRef.current.role || filtersRef.current.status) {
              applyLocalFiltersCallback();
            }
          })
          .catch((error) => {
            console.error("Error inicial:", error);
            message.error("Error al cargar usuarios");
            initialLoadRef.current = false; // Reset en caso de error
          });
      }
    }
  }, [accessToken, users.length, applyLocalFiltersCallback]);

  // Limpiar timeout al desmontar el componente
  useEffect(() => {
    return () => {
      if (debounceTimeoutRef.current) {
        clearTimeout(debounceTimeoutRef.current);
      }
    };
  }, []);

  // Manejar errores del store
  useEffect(() => {
    if (error) {
      message.error(error);
    }
  }, [error]);

  const handleSearchInputChange = (value: string) => {
    searchInputRef.current = value;

    // Limpiar timeout anterior si existe
    if (debounceTimeoutRef.current) {
      clearTimeout(debounceTimeoutRef.current);
    }

    // Establecer nuevo timeout de 2 segundos
    debounceTimeoutRef.current = setTimeout(() => {
      // Solo ejecutar búsqueda si el valor actual del input coincide con el valor del filtro
      // Esto evita ejecutar búsquedas duplicadas cuando se usa el botón "Buscar"
      if (searchInputRef.current === value) {
        updateSearch(value);
      }
    }, 2000);
  };

  const handleSearch = async () => {
    try {
      // Limpiar el debounce pendiente para evitar búsquedas duplicadas
      if (debounceTimeoutRef.current) {
        clearTimeout(debounceTimeoutRef.current);
        debounceTimeoutRef.current = null;
      }

      // Actualizar el filtro de búsqueda y ejecutar la búsqueda
      updateSearch(searchInputRef.current);
      await usersService.fetchUsers({
        ...filters,
        search: searchInputRef.current,
        page: 1,
      });
    } catch (error) {
      console.error("Error en búsqueda:", error);
    }
  };

  const handleReset = async () => {
    try {
      // Workaround: ejecutar dos veces para evitar problemas de encolación
      await usersService.resetFilters();
      await usersService.resetFilters();
    } catch (error) {
      console.error("Error al resetear:", error);
    }
  };

  const handleTableChange = async (page: number, pageSize?: number) => {
    try {
      if (pageSize && pageSize !== filters.limit) {
        // Workaround: ejecutar dos veces
        await usersService.changePageSize(pageSize);
        await usersService.changePageSize(pageSize);
      } else {
        // Workaround: ejecutar dos veces
        await usersService.changePage(page);
        await usersService.changePage(page);
      }
    } catch (error) {
      console.error("Error al cambiar página:", error);
    }
  };

  const handleActivateUser = async (userId: number) => {
    try {
      if (!accessToken) {
        message.error("No hay token de acceso disponible");
        return;
      }

      const response = await httpInterceptor.makeRequest(
        `https://api.sisivoy.com/api/admin/users/${userId}/activate`,
        {
          method: "PATCH",
          headers: {
            accept: "application/json",
          },
        }
      );

      if (!response.ok) {
        throw new Error(`Error ${response.status}: ${response.statusText}`);
      }

      const result = await response.json();
      message.success(result.message || "Usuario activado exitosamente");

      // Recargar la lista de usuarios para reflejar el cambio
      await usersService.refreshUsers();
    } catch (error) {
      console.error("Error activando usuario:", error);
      message.error("Error al activar el usuario");
    }
  };

  const handleDeactivateUser = async (userId: number) => {
    try {
      // Verificar si el usuario es el admin principal protegido
      const userToDeactivate = users.find((u) => u.id === userId);
      if (userToDeactivate?.email === PROTECTED_ADMIN_EMAIL) {
        message.warning(
          "No se puede desactivar al administrador principal. Se debe mantener siempre un administrador activo."
        );
        return;
      }

      if (!accessToken) {
        message.error("No hay token de acceso disponible");
        return;
      }

      const response = await httpInterceptor.makeRequest(
        `https://api.sisivoy.com/api/admin/users/${userId}/deactivate`,
        {
          method: "PATCH",
          headers: {
            accept: "application/json",
          },
        }
      );

      if (!response.ok) {
        throw new Error(`Error ${response.status}: ${response.statusText}`);
      }

      const result = await response.json();
      message.success(result.message || "Usuario desactivado exitosamente");

      // Recargar la lista de usuarios para reflejar el cambio
      await usersService.refreshUsers();
    } catch (error) {
      console.error("Error desactivando usuario:", error);
      message.error("Error al desactivar el usuario");
    }
  };

  const handleRoleChange = async (displayRole: string) => {
    try {
      // Convertir el rol visual al rol técnico del API
      const technicalRole = getTechnicalRole(displayRole);
      await usersService.filterByRole(technicalRole);
    } catch (error) {
      console.error("Error al filtrar por rol:", error);
    }
  };

  const handleStatusChange = async (status: string) => {
    try {
      await usersService.filterByStatus(status);
    } catch (error) {
      console.error("Error al filtrar por estado:", error);
    }
  };

  const handleRefresh = async () => {
    try {
      await usersService.refreshUsers();
    } catch (error) {
      console.error("Error al refrescar:", error);
    }
  };

  const handleViewUserImage = (
    profilePictureUrl: string | null,
    userId: number
  ) => {
    if (profilePictureUrl) {
      setUserImageUrl(`${API_BASE_URL}${profilePictureUrl}`);
      setUserIdForImage(userId);
      setUserImageModalVisible(true);
    } else {
      message.info("Este usuario no tiene imagen de perfil");
    }
  };

  const handleDeleteImage = async () => {
    if (!userIdForImage) {
      message.error("No se pudo identificar el usuario");
      return;
    }

    if (!accessToken) {
      message.error("No hay token de acceso disponible");
      return;
    }

    try {
      setDeletingImage(true);

      const response = await httpInterceptor.makeRequest(
        `https://api.sisivoy.com/api/admin/users/${userIdForImage}/delete-image`,
        {
          method: "DELETE",
          headers: {
            accept: "application/json",
          },
        }
      );

      if (!response.ok) {
        throw new Error(`Error ${response.status}: ${response.statusText}`);
      }

      const result = await response.json();
      message.success(
        result.message || "Imagen de perfil eliminada exitosamente"
      );

      // Cerrar el modal
      setUserImageModalVisible(false);
      setUserImageUrl("");
      setUserIdForImage(null);

      // Recargar la lista de usuarios para reflejar el cambio
      await usersService.refreshUsers();
    } catch (error) {
      console.error("Error eliminando imagen:", error);
      message.error("Error al eliminar la imagen de perfil");
    } finally {
      setDeletingImage(false);
    }
  };

  // Función para validar y obtener datos seguros
  const getSafeData = (
    data: unknown,
    fallback: string = "Dato no disponible"
  ) => {
    return data !== null && data !== undefined && data !== ""
      ? String(data)
      : fallback;
  };

  // Función para convertir rol técnico a rol visual
  const getRoleDisplayName = (technicalRole: string): string => {
    const roleMap: { [key: string]: string } = {
      seller: "Locatario",
      buyer: "Usuario",
      employee: "Empleado",
      admin: "Admin",
    };
    return roleMap[technicalRole.toLowerCase()] || technicalRole;
  };

  // Función para convertir rol visual a rol técnico
  const getTechnicalRole = (displayRole: string): string => {
    const roleMap: { [key: string]: string } = {
      locatario: "seller",
      usuario: "buyer",
      empleado: "employee",
      admin: "admin",
    };
    return roleMap[displayRole.toLowerCase()] || displayRole;
  };

  const getRoleColor = (role: string) => {
    if (!role || typeof role !== "string") return "default";

    const colors: { [key: string]: string } = {
      admin: "red",
      seller: "blue",
      buyer: "green",
      employee: "orange",
    };
    return colors[role.toLowerCase()] || "default";
  };

  const getStatusTag = (isActive: unknown) => {
    // Validar que isActive sea un número válido
    const activeStatus =
      typeof isActive === "number"
        ? isActive
        : typeof isActive === "string"
        ? parseInt(isActive)
        : 0;

    return activeStatus === 1 ? (
      <Tag color="green">Activo</Tag>
    ) : (
      <Tag color="red">Inactivo</Tag>
    );
  };

  const formatDate = (dateString: unknown) => {
    if (!dateString) return "Dato no disponible";

    try {
      const date = new Date(String(dateString));
      if (isNaN(date.getTime())) return "Fecha inválida";
      return date.toLocaleDateString("es-ES");
    } catch {
      return "Fecha inválida";
    }
  };

  const formatPhone = (phone: unknown) => {
    return getSafeData(phone, "Teléfono no disponible");
  };

  const getPermissionText = (permission: unknown) => {
    if (permission === 1 || permission === true || permission === "1") {
      return "Sí";
    }
    return "No";
  };

  const columns = [
    {
      title: "Usuario",
      key: "user",
      render: (record: AdminUser) => {
        try {
          const safeName = getSafeData(record?.name, "Nombre no disponible");
          const safeEmail = getSafeData(record?.email, "Email no disponible");
          const safeProfilePic = record?.profile_picture_url || null;

          return (
            <Space>
              <Avatar
                src={safeProfilePic}
                icon={<UserOutlined />}
                size="small"
              />
              <div>
                <div style={{ fontWeight: 500 }}>{safeName}</div>
                <div style={{ fontSize: "12px", color: "#666" }}>
                  {safeEmail}
                </div>
              </div>
            </Space>
          );
        } catch (error) {
          console.error("Error renderizando usuario:", error, record);
          return (
            <Space>
              <Avatar icon={<UserOutlined />} size="small" />
              <div>
                <div style={{ fontWeight: 500 }}>Error al cargar usuario</div>
                <div style={{ fontSize: "12px", color: "#666" }}>
                  Datos no disponibles
                </div>
              </div>
            </Space>
          );
        }
      },
    },
    {
      title: "Rol",
      dataIndex: "role",
      key: "role",
      render: (role: unknown) => {
        const safeRole = getSafeData(role, "Rol no disponible");
        const roleText =
          typeof safeRole === "string" ? safeRole : "Rol no disponible";

        // Mostrar el nombre visual del rol
        const displayRole = getRoleDisplayName(roleText);

        return <Tag color={getRoleColor(roleText)}>{displayRole}</Tag>;
      },
    },
    {
      title: "Teléfono",
      dataIndex: "phone",
      key: "phone",
      render: (phone: unknown) => formatPhone(phone),
    },
    {
      title: "Estado",
      dataIndex: "is_active",
      key: "is_active",
      render: (isActive: unknown) => getStatusTag(isActive),
    },
    {
      title: "Fecha de Creación",
      dataIndex: "created_at",
      key: "created_at",
      render: (date: unknown) => formatDate(date),
    },
    {
      title: "Permisos",
      key: "permissions",
      render: (record: AdminUser) => {
        try {
          // Validar que el objeto permissions existe
          const permissions = record?.permissions || {};
          const scan = permissions?.scan || {};
          const coupon = permissions?.coupon || {};
          const loyalty = permissions?.loyalty || {};
          const business = permissions?.business || {};

          return (
            <Tooltip
              title={
                <div>
                  <div>
                    <strong>Escaneo:</strong>{" "}
                    {getPermissionText(scan?.redeem_coupons)} Canjear cupones |{" "}
                    {getPermissionText(scan?.register_visits)} Registrar visitas
                  </div>
                  <div>
                    <strong>Cupones:</strong>{" "}
                    {getPermissionText(coupon?.create_coupons)} Crear |{" "}
                    {getPermissionText(coupon?.edit_coupons)} Editar
                  </div>
                  <div>
                    <strong>Fidelidad:</strong>{" "}
                    {getPermissionText(loyalty?.edit_loyalty_card)} Editar
                    tarjeta
                  </div>
                  <div>
                    <strong>Negocio:</strong>{" "}
                    {getPermissionText(business?.edit_photo)} Editar foto
                  </div>
                </div>
              }
            >
              <Button size="small" type="link">
                Ver permisos
              </Button>
            </Tooltip>
          );
        } catch (error) {
          console.error("Error renderizando permisos:", error, record);
          return (
            <Tooltip title="Error al cargar permisos">
              <Button size="small" type="link" disabled>
                Permisos no disponibles
              </Button>
            </Tooltip>
          );
        }
      },
    },
    {
      title: "Imagen",
      key: "image",
      width: 80,
      render: (record: AdminUser) => {
        return (
          <Tooltip title="Ver imagen de perfil">
            <Button
              type="default"
              size="small"
              icon={<EyeOutlined />}
              onClick={() =>
                handleViewUserImage(record.profile_picture_url, record.id)
              }
              disabled={!record.profile_picture_url}
            />
          </Tooltip>
        );
      },
    },
    {
      title: "Acciones",
      key: "actions",
      width: 120,
      render: (record: AdminUser) => {
        const isActive = record?.is_active === 1;
        const isProtectedAdmin = record?.email === PROTECTED_ADMIN_EMAIL;
        const canDeactivate = !isProtectedAdmin && isActive;

        return (
          <Space size="small">
            {!isActive ? (
              <Tooltip title="Activar usuario">
                <Button
                  type="primary"
                  size="small"
                  icon={<CheckCircleOutlined />}
                  onClick={() => handleActivateUser(record.id)}
                  style={{ backgroundColor: "#52c41a", borderColor: "#52c41a" }}
                />
              </Tooltip>
            ) : (
              <Tooltip
                title={
                  isProtectedAdmin
                    ? "No se puede desactivar al administrador principal"
                    : "Desactivar usuario"
                }
              >
                <Button
                  type="primary"
                  size="small"
                  icon={<StopOutlined />}
                  onClick={() => handleDeactivateUser(record.id)}
                  disabled={!canDeactivate}
                  style={{ backgroundColor: "#ff4d4f", borderColor: "#ff4d4f" }}
                />
              </Tooltip>
            )}
          </Space>
        );
      },
    },
  ];

  // Componente de barra de filtros (siempre visible)
  const FiltersBar = () => (
    <Card style={{ marginBottom: 16 }}>
      <Row gutter={[16, 16]} align="middle">
        <Col xs={24} sm={12} md={8}>
          <Input
            placeholder="Buscar por nombre o email"
            prefix={<SearchOutlined />}
            defaultValue={filters.search || ""}
            onChange={(e) => handleSearchInputChange(e.target.value)}
            onPressEnter={handleSearch}
          />
        </Col>
        <Col xs={24} sm={12} md={4}>
          <Select
            placeholder="Filtrar por rol"
            value={filters.role ? getRoleDisplayName(filters.role) : undefined}
            onChange={handleRoleChange}
            style={{ width: "100%" }}
            allowClear
          >
            <Option value="Admin">Admin</Option>
            <Option value="Locatario">Locatario</Option>
            <Option value="Usuario">Usuario</Option>
            <Option value="Empleado">Empleado</Option>
          </Select>
        </Col>
        <Col xs={24} sm={12} md={4}>
          <Select
            placeholder="Filtrar por estado"
            value={filters.status || undefined}
            onChange={handleStatusChange}
            style={{ width: "100%" }}
            allowClear
          >
            <Option value="active">Activo</Option>
            <Option value="inactive">Inactivo</Option>
          </Select>
        </Col>
        <Col xs={24} sm={12} md={8}>
          <Space>
            <Button
              type="primary"
              icon={<SearchOutlined />}
              onClick={handleSearch}
              loading={loading}
            >
              Buscar
            </Button>
            <Button
              icon={<ReloadOutlined />}
              onClick={handleReset}
              loading={clearing}
            >
              Limpiar
            </Button>
            <Button
              icon={<ReloadOutlined />}
              onClick={handleRefresh}
              loading={loading}
            >
              Actualizar
            </Button>
          </Space>
        </Col>
      </Row>
    </Card>
  );

  // Componente de resultados
  const ResultsSection = () => {
    // Si está cargando, mostrar spinner
    if (loading) {
      return (
        <Card>
          <div style={{ textAlign: "center", padding: "50px" }}>
            <Spin size="large" />
            <p style={{ marginTop: 16 }}>Cargando usuarios...</p>
          </div>
        </Card>
      );
    }

    // Si hay usuarios, mostrar tabla
    if (users.length > 0) {
      return (
        <Card>
          <div style={{ maxHeight: "60vh", overflowY: "auto" }}>
            <Table
              columns={columns}
              dataSource={users}
              rowKey="id"
              pagination={false}
              scroll={{ x: 800 }}
              sticky={{ offsetHeader: 0 }}
            />
          </div>

          {pagination && (
            <div style={{ marginTop: 16, textAlign: "right" }}>
              <Pagination
                current={pagination.page}
                pageSize={pagination.limit}
                total={pagination.total}
                showSizeChanger
                showQuickJumper
                showTotal={(total, range) =>
                  `${range[0]}-${range[1]} de ${total} usuarios`
                }
                onChange={handleTableChange}
                onShowSizeChange={handleTableChange}
                pageSizeOptions={["10", "25", "50", "100"]}
              />
            </div>
          )}
        </Card>
      );
    }

    // Si no hay usuarios, mostrar mensaje
    return (
      <Card>
        <div style={{ textAlign: "center", padding: "50px" }}>
          <div style={{ fontSize: "48px", color: "#d9d9d9", marginBottom: 16 }}>
            <UserOutlined />
          </div>
          <h3 style={{ color: "#666", marginBottom: 8 }}>
            No se encontraron usuarios
          </h3>
          <p style={{ color: "#999", marginBottom: 24 }}>
            {filters.search || filters.role || filters.status
              ? "Intenta ajustar los filtros de búsqueda o limpiar los filtros para ver todos los usuarios."
              : "No hay usuarios registrados en el sistema."}
          </p>
          <Space>
            <Button onClick={handleRefresh} type="primary">
              <ReloadOutlined /> Actualizar
            </Button>
            {(filters.search || filters.role || filters.status) && (
              <Button onClick={handleReset}>Limpiar filtros</Button>
            )}
          </Space>
        </div>
      </Card>
    );
  };

  return (
    <div>
      <Title level={2}>Gestión de Usuarios</Title>

      {/* Barra de filtros siempre visible */}
      <FiltersBar />

      {/* Sección de resultados */}
      <ResultsSection />

      {/* Modal para mostrar imagen de perfil */}
      <Modal
        title="Imagen de Perfil"
        open={userImageModalVisible}
        onCancel={() => {
          setUserImageModalVisible(false);
          setUserImageUrl("");
          setUserIdForImage(null);
        }}
        footer={
          userImageUrl ? (
            <div style={{ textAlign: "center" }}>
              <Button
                type="primary"
                danger
                onClick={handleDeleteImage}
                loading={deletingImage}
              >
                Borrar imagen
              </Button>
            </div>
          ) : null
        }
        width={500}
        centered
      >
        {userImageUrl ? (
          <div style={{ textAlign: "center" }}>
            <Image
              src={userImageUrl}
              alt="Imagen de perfil del usuario"
              style={{
                maxWidth: "100%",
                height: "auto",
                borderRadius: "8px",
                boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
              }}
              fallback="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAMIAAADDCAYAAADQvc6UAAABRWlDQ1BJQ0MgUHJvZmlsZQAAKJFjYGASSSwoyGFhYGDIzSspCnJ3UoiIjFJgf8LAwSDCIMogwMCcmFxc4BgQ4ANUwgCjUcG3awyMIPqyLsis7PPOq3QdDFcvjV3jOD1boQVTPQrgSkktTgbSf4A4LbmgqISBgTEFyFYuLykAsTuAbJEioKOA7DkgdjqEvQHEToKwj4DVhAQ5A9k3gGyB5IxEoBmML4BsnSQk8XQkNtReEOBxcfXxUQg1Mjc0dyHgXNJBSWpFCYh2zi+oLMpMzyhRcASGUqqCZ16yno6CkYGRAQMDKMwhqj/fAIcloxgHQqxAjIHBEugw5sUIsSQpBobtQPdLciLEVJYzMPBHMDBsayhILEqEO4DxG0txmrERhM29nYGBddr//5/DGRjYNRkY/l7////39v///y4Dmn+LgeHANwDrkl1AuO+pmgAAADhlWElmTU0AKgAAAAgAAYdpAAQAAAABAAAAGgAAAAAAAqACAAQAAAABAAAAwqADAAQAAAABAAAAwwAAAAD9b/HnAAAHlklEQVR4Ae3dP3Ik1RnG4W+FgYxN"
            />
          </div>
        ) : (
          <div style={{ textAlign: "center", padding: "50px" }}>
            <div
              style={{ fontSize: "48px", color: "#d9d9d9", marginBottom: 16 }}
            >
              <UserOutlined />
            </div>
            <h3 style={{ color: "#666", marginBottom: 8 }}>
              No hay imagen disponible
            </h3>
            <p style={{ color: "#999" }}>
              Este usuario no tiene imagen de perfil.
            </p>
          </div>
        )}
      </Modal>
    </div>
  );
};

export default UsersView;
