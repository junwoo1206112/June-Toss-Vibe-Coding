import { Component, type ReactNode } from "react";

interface Props {
  children: ReactNode;
}
interface State {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
  state: State = { hasError: false, error: null };

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  render() {
    if (this.state.hasError) {
      return (
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            minHeight: "100vh",
            padding: "24px",
            textAlign: "center",
            gap: "16px",
          }}
        >
          <p style={{ fontSize: "18px", fontWeight: 600, color: "#333" }}>
            일시적인 오류가 발생했어요
          </p>
          <p style={{ fontSize: "14px", color: "#888" }}>
            {this.state.error?.message ?? "알 수 없는 오류"}
          </p>
          <button
            style={{
              padding: "12px 24px",
              borderRadius: "10px",
              background: "#FF6B35",
              color: "white",
              border: "none",
              fontSize: "15px",
              cursor: "pointer",
            }}
            onClick={() => {
              this.setState({ hasError: false, error: null });
              window.location.reload();
            }}
          >
            다시 시도
          </button>
        </div>
      );
    }
    return this.props.children;
  }
}
