import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import { useAuth } from './context/AuthContext';
import OrderForm from './pages/OrderForm';
import ProductManager from './pages/ProductManager';
import OrdersList from './pages/OrdersList';
import OrderDetails from './pages/OrderDetails';
import Accounting from './pages/Accounting';
import InventoryPurchase from './pages/InventoryPurchase';
import AuditReport from './pages/AuditReport';
import UsersCRUD from './pages/UsersCRUD';
import RegisterClient from './pages/RegisterClient';
import Layout from './components/Layout';
import './styles/global.css';

const ProtectedRoute = ({ children }) => {
  const { user } = useAuth();
  if (!user) return <Navigate to="/login" />;
  return <Layout>{children}</Layout>;
};

function App() {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />

      <Route path="/dashboard" element={
        <ProtectedRoute><Dashboard /></ProtectedRoute>
      } />

      <Route path="/pedido" element={
        <ProtectedRoute><OrderForm mode="pedido" /></ProtectedRoute>
      } />

      <Route path="/cotizar" element={
        <ProtectedRoute><OrderForm mode="cotizar" /></ProtectedRoute>
      } />

      <Route path="/productos" element={
        <ProtectedRoute><ProductManager /></ProtectedRoute>
      } />

      <Route path="/pedidos-lista" element={
        <ProtectedRoute><OrdersList /></ProtectedRoute>
      } />

      <Route path="/pedidos/:id" element={
        <ProtectedRoute><OrderDetails /></ProtectedRoute>
      } />

      <Route path="/contabilidad" element={
        <ProtectedRoute><Accounting /></ProtectedRoute>
      } />

      <Route path="/compras" element={
        <ProtectedRoute><InventoryPurchase /></ProtectedRoute>
      } />

      <Route path="/auditoria" element={
        <ProtectedRoute><AuditReport /></ProtectedRoute>
      } />

      <Route path="/usuarios" element={
        <ProtectedRoute><UsersCRUD /></ProtectedRoute>
      } />

      <Route path="/venta-directa" element={
        <ProtectedRoute><OrderForm mode="venta-directa" /></ProtectedRoute>
      } />

      <Route path="/nuevo-cliente" element={
        <ProtectedRoute><RegisterClient /></ProtectedRoute>
      } />

      <Route path="*" element={<Navigate to="/dashboard" replace />} />
    </Routes>
  );
}

export default App;
