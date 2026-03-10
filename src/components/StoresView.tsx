import React, { useEffect, useRef, useMemo, useState } from "react";
import {
  Table,
  Card,
  Input,
  Select,
  Button,
  Space,
  Tag,
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
  ShopOutlined,
  EnvironmentOutlined,
  PhoneOutlined,
  UserOutlined,
  GlobalOutlined,
  CheckCircleOutlined,
  StopOutlined,
  EyeOutlined,
} from "@ant-design/icons";
import { useStoresStore } from "../stores/storesStore";
import { storesService } from "../services/storesService";
import { useAuth } from "../hooks/useAuth";
import { httpInterceptor } from "../utils/httpInterceptor";
import { API_BASE_URL } from "../API";
import type { Store, StoreDetailsResponse, StoreImage } from "../API";

const { Title } = Typography;
const { Option } = Select;

const StoresView: React.FC = () => {
  console.log("StoresView component rendering");
  const { accessToken } = useAuth();
  const searchInputRef = useRef<string>("");
  const debounceTimeoutRef = useRef<number | null>(null);

  // Estado para el modal de imágenes
  const [imagesModalVisible, setImagesModalVisible] = useState(false);
  const [storeImages, setStoreImages] = useState<StoreImage[]>([]);
  const [loadingImages, setLoadingImages] = useState(false);
  const [storeIdForImages, setStoreIdForImages] = useState<number | null>(null);
  const [deletingImages, setDeletingImages] = useState(false);

  // Estado del store
  const {
    stores,
    pagination,
    filters,
    loading,
    clearing,
    error,
    updateSearch,
  } = useStoresStore();

  // Filtrado local por estado y tipo de tienda
  const filteredStores = useMemo(() => {
    let filtered = stores;

    // Debug: Log de los datos para verificar los valores de store_type
    if (stores.length > 0) {
      console.log("Valores únicos de store_type:", [
        ...new Set(stores.map((store) => store.store_type)),
      ]);
      console.log("Filtro storeType actual:", filters.storeType);
    }

    // Filtro por tipo de tienda
    if (filters.storeType && filters.storeType !== "") {
      filtered = filtered.filter((store) => {
        // Normalizar ambos valores para comparación
        const storeTypeNormalized = store.store_type.toLowerCase().trim();
        const filterTypeNormalized = filters.storeType!.toLowerCase().trim();

        // Comparación exacta
        const exactMatch = storeTypeNormalized === filterTypeNormalized;

        // También verificar si contiene el tipo (para casos como "Fast Food")
        const containsMatch =
          storeTypeNormalized.includes(filterTypeNormalized) ||
          filterTypeNormalized.includes(storeTypeNormalized);

        const matches = exactMatch || containsMatch;
        console.log(
          `Comparando: "${store.store_type}" con "${filters.storeType}" = ${matches}`
        );
        return matches;
      });
    }

    // Filtro por estado
    if (filters.status && filters.status !== "") {
      if (filters.status === "active") {
        filtered = filtered.filter((store) => store.is_active === 1);
      } else if (filters.status === "inactive") {
        filtered = filtered.filter((store) => store.is_active === 0);
      }
    }

    console.log(`Tiendas filtradas: ${filtered.length} de ${stores.length}`);
    return filtered;
  }, [stores, filters.storeType, filters.status]);

  // Configurar el token en el servicio
  useEffect(() => {
    if (accessToken) {
      storesService.setAccessToken(accessToken);
      // Solo cargar datos si no hay tiendas cargadas
      if (stores.length === 0) {
        storesService.fetchStores(filters).catch((error) => {
          console.error("Error inicial:", error);
          message.error("Error al cargar tiendas");
        });
      }
    }
  }, [accessToken, stores.length, filters]);

  // Manejar errores del store
  useEffect(() => {
    if (error) {
      message.error(error);
    }
  }, [error]);

  // Limpiar timeout al desmontar el componente
  useEffect(() => {
    return () => {
      if (debounceTimeoutRef.current) {
        clearTimeout(debounceTimeoutRef.current);
      }
    };
  }, []);

  const handleSearchInputChange = (value: string) => {
    searchInputRef.current = value;

    // Limpiar timeout anterior si existe
    if (debounceTimeoutRef.current) {
      clearTimeout(debounceTimeoutRef.current);
    }

    // Establecer nuevo timeout de 2 segundos
    debounceTimeoutRef.current = setTimeout(() => {
      updateSearch(value);
    }, 2000);
  };

  const handleSearch = async () => {
    try {
      await storesService.searchStores(searchInputRef.current);
    } catch (error) {
      console.error("Error en búsqueda:", error);
    }
  };

  const handleReset = async () => {
    try {
      // Workaround: ejecutar dos veces para evitar problemas de encolación
      await storesService.resetFilters();
      await storesService.resetFilters();
    } catch (error) {
      console.error("Error al resetear:", error);
    }
  };

  const handleTableChange = async (page: number, pageSize?: number) => {
    try {
      if (pageSize && pageSize !== filters.limit) {
        // Workaround: ejecutar dos veces
        await storesService.changePageSize(pageSize);
        await storesService.changePageSize(pageSize);
      } else {
        // Workaround: ejecutar dos veces
        await storesService.changePage(page);
        await storesService.changePage(page);
      }
    } catch (error) {
      console.error("Error al cambiar página:", error);
    }
  };

  const handleActivateStore = async (storeId: number) => {
    try {
      if (!accessToken) {
        message.error("No hay token de acceso disponible");
        return;
      }

      const response = await httpInterceptor.makeRequest(
        `https://api.sisivoy.com/api/admin/stores/${storeId}/activate`,
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
      message.success(result.message || "Tienda activada exitosamente");

      // Log antes del refresh
      console.log("Antes del refresh - Tienda activada:", storeId);

      // Recargar la lista de tiendas para reflejar el cambio
      await storesService.refreshStores();

      // Log después del refresh
      console.log("Después del refresh - Lista actualizada");
    } catch (error) {
      console.error("Error activando tienda:", error);
      message.error("Error al activar la tienda");
    }
  };

  const handleDeactivateStore = async (storeId: number, ownerId?: number) => {
    try {
      if (!accessToken) {
        message.error("No hay token de acceso disponible");
        return;
      }

      const response = await httpInterceptor.makeRequest(
        `https://api.sisivoy.com/api/admin/stores/${storeId}/deactivate`,
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
      message.success(result.message || "Tienda desactivada exitosamente");

      // Log antes del refresh
      console.log("Antes del refresh - Tienda desactivada:", storeId);

      // Si hay ownerId, también desactivar la cuenta del dueño
      if (ownerId) {
        try {
          console.log("Desactivando cuenta del dueño:", ownerId);

          const ownerResponse = await httpInterceptor.makeRequest(
            `https://api.sisivoy.com/api/admin/users/${ownerId}/deactivate`,
            {
              method: "PATCH",
              headers: {
                accept: "application/json",
              },
            }
          );

          if (ownerResponse.ok) {
            const ownerResult = await ownerResponse.json();
            console.log("Cuenta del dueño desactivada:", ownerResult.message);
            message.success(
              "Tienda y cuenta del dueño desactivadas exitosamente"
            );
          } else {
            console.warn("No se pudo desactivar la cuenta del dueño");
            // Continuar de todas formas
          }
        } catch (ownerError) {
          console.error("Error desactivando cuenta del dueño:", ownerError);
          // Continuar de todas formas
        }
      }

      // Recargar la lista de tiendas para reflejar el cambio
      await storesService.refreshStores();

      // Log después del refresh
      console.log("Después del refresh - Lista actualizada");
    } catch (error) {
      console.error("Error desactivando tienda:", error);
      message.error("Error al desactivar la tienda");
    }
  };

  const handleStoreTypeChange = async (storeType: string) => {
    try {
      await storesService.filterByStoreType(storeType);
    } catch (error) {
      console.error("Error al filtrar por tipo:", error);
    }
  };

  const handleStatusChange = async (status: string) => {
    try {
      await storesService.filterByStatus(status);
    } catch (error) {
      console.error("Error al filtrar por estado:", error);
    }
  };

  const handleRefresh = async () => {
    try {
      await storesService.refreshStores();
    } catch (error) {
      console.error("Error al refrescar:", error);
    }
  };

  const handleViewImages = async (storeId: number) => {
    try {
      setLoadingImages(true);
      const response: StoreDetailsResponse =
        await storesService.getStoreDetails(storeId);
      setStoreImages(response.images);
      setStoreIdForImages(storeId);
      setImagesModalVisible(true);
    } catch (error) {
      console.error("Error al cargar imágenes:", error);
      message.error("Error al cargar las imágenes de la tienda");
    } finally {
      setLoadingImages(false);
    }
  };

  const handleDeleteImages = async () => {
    if (!storeIdForImages) {
      message.error("No se pudo identificar la tienda");
      return;
    }

    if (!accessToken) {
      message.error("No hay token de acceso disponible");
      return;
    }

    try {
      setDeletingImages(true);

      // Realizar 5 peticiones DELETE, una para cada posición (1-5)
      const deletePromises = [];
      for (let position = 1; position <= 5; position++) {
        deletePromises.push(
          httpInterceptor.makeRequest(
            `https://api.sisivoy.com/api/stores/${storeIdForImages}/images/${position}`,
            {
              method: "DELETE",
              headers: {
                accept: "application/json",
              },
            }
          )
        );
      }

      // Ejecutar todas las peticiones en paralelo
      const responses = await Promise.allSettled(deletePromises);

      // Verificar resultados
      let successCount = 0;
      let errorCount = 0;

      responses.forEach((result, index) => {
        if (result.status === "fulfilled" && result.value.ok) {
          successCount++;
        } else {
          errorCount++;
          console.error(
            `Error eliminando imagen en posición ${index + 1}:`,
            result.status === "fulfilled" ? result.value : result.reason
          );
        }
      });

      if (successCount > 0) {
        message.success(`${successCount} imagen(es) eliminada(s) exitosamente`);
      }

      if (errorCount > 0 && successCount === 0) {
        message.error("Error al eliminar las imágenes");
      } else if (errorCount > 0) {
        message.warning(
          `${successCount} imagen(es) eliminada(s), ${errorCount} error(es)`
        );
      }

      // Cerrar el modal y recargar imágenes
      setImagesModalVisible(false);
      setStoreIdForImages(null);
      setStoreImages([]);

      // Recargar la lista de tiendas para reflejar el cambio
      await storesService.refreshStores();
    } catch (error) {
      console.error("Error eliminando imágenes:", error);
      message.error("Error al eliminar las imágenes");
    } finally {
      setDeletingImages(false);
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

  const getStoreTypeColor = (storeType: string) => {
    if (!storeType || typeof storeType !== "string") return "default";

    const colors: { [key: string]: string } = {
      cafe: "brown",
      restaurant: "red",
      retail: "blue",
      service: "green",
      pharmacy: "purple",
      supermarket: "orange",
    };
    return colors[storeType.toLowerCase()] || "default";
  };

  const getSizeColor = (size: string) => {
    if (!size || typeof size !== "string") return "default";

    const colors: { [key: string]: string } = {
      small: "green",
      medium: "blue",
      large: "red",
    };
    return colors[size.toLowerCase()] || "default";
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

  const formatWebsite = (website: unknown) => {
    const safeWebsite = getSafeData(website, "Sitio web no disponible");
    if (safeWebsite === "Sitio web no disponible") return safeWebsite;

    // Si es una URL válida, crear enlace
    if (safeWebsite.startsWith("http")) {
      return (
        <a href={safeWebsite} target="_blank" rel="noopener noreferrer">
          <GlobalOutlined /> Sitio web
        </a>
      );
    }

    return safeWebsite;
  };

  const columns = [
    {
      title: "Tienda",
      key: "store",
      render: (record: Store) => {
        try {
          const safeName = getSafeData(record?.name, "Nombre no disponible");
          const safeAddress = getSafeData(
            record?.address,
            "Dirección no disponible"
          );

          return (
            <Space>
              <ShopOutlined style={{ fontSize: "20px", color: "#1890ff" }} />
              <div>
                <div style={{ fontWeight: 500 }}>{safeName}</div>
                <div style={{ fontSize: "12px", color: "#666" }}>
                  <EnvironmentOutlined /> {safeAddress}
                </div>
              </div>
            </Space>
          );
        } catch (error) {
          console.error("Error renderizando tienda:", error, record);
          return (
            <Space>
              <ShopOutlined style={{ fontSize: "20px", color: "#d9d9d9" }} />
              <div>
                <div style={{ fontWeight: 500 }}>Error al cargar tienda</div>
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
      title: "Tipo",
      dataIndex: "store_type",
      key: "store_type",
      render: (storeType: unknown) => {
        const safeType = getSafeData(storeType, "Tipo no disponible");
        const typeText =
          typeof safeType === "string" ? safeType : "Tipo no disponible";

        return (
          <Tag color={getStoreTypeColor(typeText)}>
            {typeText.charAt(0).toUpperCase() + typeText.slice(1)}
          </Tag>
        );
      },
    },
    {
      title: "Tamaño",
      dataIndex: "size",
      key: "size",
      render: (size: unknown) => {
        const safeSize = getSafeData(size, "Tamaño no disponible");
        const sizeText =
          typeof safeSize === "string" ? safeSize : "Tamaño no disponible";

        return (
          <Tag color={getSizeColor(sizeText)}>
            {sizeText.charAt(0).toUpperCase() + sizeText.slice(1)}
          </Tag>
        );
      },
    },
    {
      title: "Contacto",
      key: "contact",
      render: (record: Store) => {
        try {
          const safePhone = formatPhone(record?.phone_number);
          const safeWebsite = formatWebsite(record?.website);

          return (
            <Space direction="vertical" size="small">
              <div>
                <PhoneOutlined /> {safePhone}
              </div>
              <div>{safeWebsite}</div>
            </Space>
          );
        } catch (error) {
          console.error("Error renderizando contacto:", error, record);
          return <span>Contacto no disponible</span>;
        }
      },
    },
    {
      title: "Propietario",
      key: "owner",
      render: (record: Store) => {
        try {
          const safeOwnerName = getSafeData(
            record?.owner_name,
            "Propietario no disponible"
          );
          const safeOwnerEmail = getSafeData(
            record?.owner_email,
            "Email no disponible"
          );
          const isActive = record?.owner_is_active;

          // Debug: Log para verificar ambos valores
          console.log(
            "Store ID:",
            record.id,
            "is_active:",
            record?.is_active,
            "owner_is_active:",
            record?.owner_is_active
          );

          return (
            <Space direction="vertical" size="small">
              <div>
                <UserOutlined /> {safeOwnerName}
              </div>
              <div style={{ fontSize: "12px", color: "#666" }}>
                {safeOwnerEmail}
              </div>
              <div>
                <Tag color={isActive ? "green" : "red"}>
                  {isActive ? "Activo" : "Inactivo"}
                </Tag>
              </div>
            </Space>
          );
        } catch (error) {
          console.error("Error renderizando propietario:", error, record);
          return <span>Propietario no disponible</span>;
        }
      },
    },
    {
      title: "Fecha de Creación",
      dataIndex: "created_at",
      key: "created_at",
      render: (date: unknown) => formatDate(date),
    },
    {
      title: "Consumo Promedio",
      dataIndex: "average_consumption",
      key: "average_consumption",
      render: (consumption: unknown) => {
        const safeConsumption =
          consumption !== null && consumption !== undefined
            ? Number(consumption)
            : 0;

        return `$${safeConsumption.toFixed(2)}`;
      },
    },
    {
      title: "Imágenes",
      key: "images",
      width: 100,
      render: (record: Store) => {
        return (
          <Tooltip title="Ver imágenes de la tienda">
            <Button
              type="default"
              size="small"
              icon={<EyeOutlined />}
              onClick={() => handleViewImages(record.id)}
              loading={loadingImages}
            />
          </Tooltip>
        );
      },
    },
    {
      title: "Acciones",
      key: "actions",
      width: 120,
      render: (record: Store) => {
        const isActive = record?.is_active === 1;

        // Debug: Log para verificar los valores
        console.log(
          "Store ID:",
          record.id,
          "is_active:",
          record?.is_active,
          "isActive:",
          isActive
        );

        return (
          <Space size="small">
            {!isActive ? (
              <Tooltip title="Activar tienda">
                <Button
                  type="primary"
                  size="small"
                  icon={<CheckCircleOutlined />}
                  onClick={() => handleActivateStore(record.id)}
                  style={{ backgroundColor: "#52c41a", borderColor: "#52c41a" }}
                />
              </Tooltip>
            ) : (
              <Tooltip title="Desactivar tienda y cuenta del dueño">
                <Button
                  type="primary"
                  size="small"
                  icon={<StopOutlined />}
                  onClick={() =>
                    handleDeactivateStore(record.id, record.owner_id)
                  }
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
            placeholder="Buscar por nombre o dirección"
            prefix={<SearchOutlined />}
            defaultValue={filters.search || ""}
            onChange={(e) => handleSearchInputChange(e.target.value)}
            onPressEnter={handleSearch}
          />
        </Col>
        <Col xs={24} sm={12} md={4}>
          <Select
            placeholder="Filtrar por tipo"
            value={filters.storeType || undefined}
            onChange={handleStoreTypeChange}
            style={{ width: "100%" }}
            allowClear
          >
            <Option value="Cafeteria">Cafetería</Option>
            <Option value="Restaurant">Restaurante</Option>
            <Option value="Retail">Retail</Option>
            <Option value="Service">Servicio</Option>
            <Option value="Pharmacy">Farmacia</Option>
            <Option value="Supermarket">Supermercado</Option>
            <Option value="Bar">Bar</Option>
            <Option value="Bakery">Panadería</Option>
            <Option value="Fast Food">Comida Rápida</Option>
            <Option value="Coffee Shop">Cafetería</Option>
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
            <p style={{ marginTop: 16 }}>Cargando tiendas...</p>
          </div>
        </Card>
      );
    }

    // Si hay tiendas, mostrar tabla
    if (filteredStores.length > 0) {
      return (
        <Card>
          <div style={{ maxHeight: "60vh", overflowY: "auto" }}>
            <Table
              columns={columns}
              dataSource={filteredStores}
              rowKey="id"
              pagination={false}
              scroll={{ x: 1000 }}
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
                  `${range[0]}-${range[1]} de ${total} tiendas`
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

    // Si no hay tiendas, mostrar mensaje
    return (
      <Card>
        <div style={{ textAlign: "center", padding: "50px" }}>
          <div style={{ fontSize: "48px", color: "#d9d9d9", marginBottom: 16 }}>
            <ShopOutlined />
          </div>
          <h3 style={{ color: "#666", marginBottom: 8 }}>
            No se encontraron tiendas
          </h3>
          <p style={{ color: "#999", marginBottom: 24 }}>
            {filters.search || filters.storeType || filters.status
              ? "Intenta ajustar los filtros de búsqueda o limpiar los filtros para ver todas las tiendas."
              : "No hay tiendas registradas en el sistema."}
          </p>
          <Space>
            <Button onClick={handleRefresh} type="primary">
              <ReloadOutlined /> Actualizar
            </Button>
            {(filters.search || filters.storeType || filters.status) && (
              <Button onClick={handleReset}>Limpiar filtros</Button>
            )}
          </Space>
        </div>
      </Card>
    );
  };

  return (
    <div>
      <Title level={2}>Gestión de Tiendas</Title>

      {/* Barra de filtros siempre visible */}
      <FiltersBar />

      {/* Sección de resultados */}
      <ResultsSection />

      {/* Modal para mostrar imágenes */}
      <Modal
        title="Imágenes de la Tienda"
        open={imagesModalVisible}
        onCancel={() => {
          setImagesModalVisible(false);
          setStoreIdForImages(null);
          setStoreImages([]);
        }}
        footer={null}
        width={800}
        centered
      >
        {loadingImages ? (
          <div style={{ textAlign: "center", padding: "50px" }}>
            <Spin size="large" />
            <p style={{ marginTop: 16 }}>Cargando imágenes...</p>
          </div>
        ) : storeImages.length > 0 ? (
          <div style={{ position: "relative" }}>
            <div
              style={{
                maxHeight: "60vh",
                overflowY: "auto",
                paddingBottom: "80px",
              }}
            >
              <Image.PreviewGroup>
                {storeImages.map((image, index) => (
                  <div key={image.si_id}>
                    <div
                      style={{
                        display: "flex",
                        justifyContent: "center",
                        marginBottom: 16,
                        padding: "16px 0",
                      }}
                    >
                      <Image
                        src={`${API_BASE_URL}${image.si_url}`}
                        alt={`Imagen ${index + 1} de la tienda`}
                        style={{
                          maxWidth: "100%",
                          height: "auto",
                          borderRadius: "8px",
                          boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
                        }}
                        fallback="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAMIAAADDCAYAAADQvc6UAAABRWlDQ1BJQ0MgUHJvZmlsZQAAKJFjYGASSSwoyGFhYGDIzSspCnJ3UoiIjFJgf8LAwSDCIMogwMCcmFxc4BgQ4ANUwgCjUcG3awyMIPqyLsis7PPOq3QdDFcvjV3jOD1boQVTPQrgSkktTgbSf4A4LbmgqISBgTEFyFYuLykAsTuAbJEioKOA7DkgdjqEvQHEToKwj4DVhAQ5A9k3gGyB5IxEoBmML4BsnSQk8XQkNtReEOBxcfXxUQg1Mjc0dyHgXNJBSWpFCYh2zi+oLMpMzyhRcASGUqqCZ16yno6CkYGRAQMDKMwhqj/fAIcloxgHQqxAjIHBEugw5sUIsSQpBobtQPdLciLEVJYzMPBHMDBsayhILEqEO4DxG0txmrERhM29nYGBddr//5/DGRjYNRkY/l7////39v///y4Dmn+LgeHANwDrkl1AuO+pmgAAADhlWElmTU0AKgAAAAgAAYdpAAQAAAABAAAAGgAAAAAAAqACAAQAAAABAAAAwqADAAQAAAABAAAAwwAAAAD9b/HnAAAHlklEQVR4Ae3dP3Ik1RnG4W+FgYxN"
                      />
                    </div>
                    {index < storeImages.length - 1 && (
                      <div
                        style={{
                          height: "1px",
                          backgroundColor: "#f0f0f0",
                          margin: "0 20px",
                          borderBottom: "1px solid #e8e8e8",
                        }}
                      />
                    )}
                  </div>
                ))}
              </Image.PreviewGroup>
            </div>
            {/* Botón fijo en la parte inferior */}
            <div
              style={{
                position: "absolute",
                bottom: 0,
                left: 0,
                right: 0,
                padding: "16px",
                backgroundColor: "white",
                borderTop: "1px solid #f0f0f0",
                textAlign: "center",
                zIndex: 10,
              }}
            >
              <Button
                type="primary"
                danger
                onClick={handleDeleteImages}
                loading={deletingImages}
                size="large"
                style={{ width: "200px" }}
              >
                Borrar imagenes
              </Button>
            </div>
          </div>
        ) : (
          <div style={{ textAlign: "center", padding: "50px" }}>
            <div
              style={{ fontSize: "48px", color: "#d9d9d9", marginBottom: 16 }}
            >
              <EyeOutlined />
            </div>
            <h3 style={{ color: "#666", marginBottom: 8 }}>
              No hay imágenes disponibles
            </h3>
            <p style={{ color: "#999" }}>
              Esta tienda no tiene imágenes registradas.
            </p>
          </div>
        )}
      </Modal>
    </div>
  );
};

export default StoresView;
